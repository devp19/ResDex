import { useState } from 'react';
import { s3 } from '../awsConfig';
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const MAX_FILE_SIZE_MB = 5; // so that someone doesn't upload a file of like 1000gb 
const MAX_UPLOADS_PER_DAY = 10; // just so someone doesn't try to fill up the S3 Bucket..

const PDFUpload = ({ user, onUploadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setErrorModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrorMessage(`File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
        setErrorModal(true);
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
      setShowModal(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !title.trim()) return;

    setLoading(true);
    setShowModal(false);
    setErrorModal(false);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnapshot = await getDoc(userDocRef);
      const currentPdfs = docSnapshot.exists() ? docSnapshot.data().pdfs || [] : [];

      const today = new Date().toISOString().split('T')[0];
      const todaysUploads = currentPdfs.filter(pdf => pdf.uploadDate.startsWith(today));
      
      if (todaysUploads.length >= MAX_UPLOADS_PER_DAY) {
        setLoading(false);
        setErrorMessage(`You have reached the daily limit of ${MAX_UPLOADS_PER_DAY} uploads.`);
        setErrorModal(true);
        return;
      }
      setErrorModal(false);
      setErrorMessage('')
      const params = {
        Bucket: 'resdex-bucket',
        Key: `pdfs/${user.uid}/${selectedFile.name}`,
        Body: selectedFile,
        ContentType: 'application/pdf',
      };

      const options = { partSize: 5 * 1024 * 1024, queueSize: 1 };
      const data = await s3.upload(params, options).promise();

      const pdfData = {
        url: data.Location,
        title: title,
        description: description,
        uploadDate: new Date().toISOString(),
      };

      if (!docSnapshot.exists()) {
        await setDoc(userDocRef, { pdfs: [pdfData] });
      } else {
        await updateDoc(userDocRef, { pdfs: arrayUnion(pdfData) });
      }

      if (onUploadComplete) {
        onUploadComplete(user.uid);
      }

      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setErrorMessage('');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading PDF: ', error);
      setErrorMessage('Failed to upload. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
    },
    uploadArea: {
      cursor: 'pointer',
      borderRadius: '5px',
      textAlign: 'center',
    }
  };

  return (
    <div>
      <input
        id="pdfInput"
        type="file"
        style={{ display: 'none' }}
        accept=".pdf"
        onChange={handleFileChange}
      />
      <div
        // style={styles.uploadArea}
        style={{padding: '10px'}}
        onClick={() => document.getElementById('pdfInput').click()}
      >
      
      <button className='custom-edit'> 
      <svg style={{marginRight: '14px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-file-earmark-plus-fill" viewBox="0 0 16 16">
  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0"/>
</svg>
Upload Research
                      </button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{color: 'black'}}>Document Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{color: 'black'}}>Title</Form.Label>
              <Form.Control
                maxLength="50"
                type="text"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3 pt-3">
              <Form.Label style={{color: 'black'}}>Description</Form.Label>
              <Form.Control
                maxLength="300"
                as="textarea"
                rows={3}
                placeholder="Enter document description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="custom-read border" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="custom-view" onClick={handleUpload} disabled={!title.trim()}>
            Upload
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showErrorModal} onHide={() => setErrorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className='title'> Error Uploading Document </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </Modal.Body>
        <Modal.Footer>
          <button className="custom border" onClick={() =>  {setErrorModal(false); window.location.reload();}}>
            Close
          </button>
        </Modal.Footer>
      </Modal>


      {loading && (
        <div style={styles.loadingOverlay}>
          <Spinner animation="border" variant="light" />
        </div>
      )}
    </div>
  );
};

export default PDFUpload;
