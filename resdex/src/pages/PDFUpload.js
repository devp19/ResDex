import { useState } from 'react';
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';

const MAX_FILE_SIZE_MB = 5;
const MAX_UPLOADS_PER_DAY = 10;

const interestOptions = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Engineering', label: 'Engineering' },
];

const PDFUpload = ({ user, onUploadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setErrorModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);

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

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user.uid);

      const response = await fetch('https://resdex.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error('Upload failed');
      }

      const workerUrl = result.url.replace(
  'https://pub-b9219a60c2ea4807b8bb38a7c82cf268.r2.dev',
  'https://resdex-r2-proxy.devptl841806.workers.dev'
);

const pdfData = {
  url: workerUrl,        
  objectKey: result.objectKey, 
  title: title,
  description: description,
  uploadDate: new Date().toISOString(),
  topics: selectedTopics.map(topic => topic.value),
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
      setSelectedTopics([]);
      window.location.reload();
    } catch (error) {
      console.error('Error uploading PDF: ', error);
      setErrorMessage('Failed to upload. Please try again.');
      setErrorModal(true);
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

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'white' : 'black',
      backgroundColor: state.isSelected ? 'rgba(189,197,209,.3)' : 'white',
      '&:hover': {
        backgroundColor: 'rgba(189,197,209,.3)',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'black',
      padding: '5px',
      borderRadius: '5px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      ':hover': {
        backgroundColor: 'black',
        color: 'white',
      },
    }),
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
      <div style={{ padding: '10px' }} onClick={() => document.getElementById('pdfInput').click()}>
        <button className='custom-edit'> 
          <svg style={{ marginRight: '14px' }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-file-earmark-plus-fill" viewBox="0 0 16 16">
            <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0"/>
          </svg>
          Upload Research
        </button>
      </div>

      <Modal show={showModal} className='box' onHide={() => setShowModal(false)}>
        <Modal.Header style={{ background: '#e5e3df', borderBottom: '1px solid white' }} closeButton>
          <Modal.Title style={{ color: 'black' }}>Document Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#e5e3df', borderBottom: '1px solid white' }}>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'black' }}>Title</Form.Label>
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
              <Form.Label style={{ color: 'black' }}>Description</Form.Label>
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
            <Form.Group className="mb-3 pt-3">
              <Form.Label style={{ color: 'black' }}>Relevant Topics</Form.Label>
              <Select
                isMulti
                name="topics"
                options={interestOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                value={selectedTopics}
                onChange={(selected) => {
                  if (selected.length <= 3) {
                    setSelectedTopics(selected);
                  }
                }}
                isOptionDisabled={() => selectedTopics.length >= 3}
                placeholder="Select up to 3 topics"
                styles={customStyles}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: '#e5e3df', borderBottom: '1px solid white' }}>
          <button className="custom-view" onClick={() => setShowModal(false)}>
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
          <button className="custom border" onClick={() => { setErrorModal(false); window.location.reload(); }}>
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
