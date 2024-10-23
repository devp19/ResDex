import { useState } from 'react';
import { s3 } from '../awsConfig';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const PDFUpload = ({ user, onUploadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowModal(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !title.trim()) return;
  
    setLoading(true);
    setShowModal(false);

    const params = {
      Bucket: 'resdex-bucket',
      Key: `pdfs/${user.uid}/${selectedFile.name}`,
      Body: selectedFile,
      ContentType: 'application/pdf',
    };
  
    try {
      const options = { partSize: 5 * 1024 * 1024, queueSize: 1 };
      const data = await s3.upload(params, options).promise();
      
      const pdfData = {
        url: data.Location,
        title: title,
        description: description,
        uploadDate: new Date().toISOString()
      };

      const userDocRef = doc(db, 'users', user.uid);
      const docSnapshot = await getDoc(userDocRef);
      
      if (!docSnapshot.exists()) {
        await setDoc(userDocRef, { pdfs: [pdfData] });
      } else {
        const currentPdfs = docSnapshot.data().pdfs || [];
        await updateDoc(userDocRef, { 
          pdfs: [...currentPdfs, pdfData] 
        });
      }
      
      if (onUploadComplete) {
        onUploadComplete(user.uid);
      }

      setTitle('');
      setDescription('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading PDF: ', error);
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
        style={styles.uploadArea}
        onClick={() => document.getElementById('pdfInput').click()}
      >
        <svg style={{marginBottom: '20px'}} xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-upload" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
        </svg>
        <h5>Upload Document</h5>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Document Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title*</Form.Label>
              <Form.Control
                maxLength="50"
                type="text"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description*</Form.Label>
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
          <button className="custom border" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="custom" onClick={handleUpload} disabled={!title.trim()}>
            Upload
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