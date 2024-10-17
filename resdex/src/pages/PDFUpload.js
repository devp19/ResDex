import { useState } from 'react';
import { s3 } from '../awsConfig';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Spinner from 'react-bootstrap/Spinner';

const PDFUpload = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      await handleUpload(selectedFile); 
    }
  };

  const handleUpload = async (file) => {
    if (!file || !user) return;
  
    console.log(file)
    setLoading(true);
    const params = {
      Bucket: 'resdex-bucket',
      Key: `pdfs/${user.uid}/${file.name}`,
      Body: file,
      ContentType: 'application/pdf',
    };
  
    try {
      const options = { partSize: 5 * 1024 * 1024, queueSize: 1 };
  
      const data = await s3.upload(params, options).promise();
      const pdfUrl = data.Location;
      setPdfUrl(pdfUrl);

  
      const userDocRef = doc(db, 'users', user.uid);
      const docSnapshot = await getDoc(userDocRef);
      if (!docSnapshot.exists()) {
        await setDoc(userDocRef, { pdfUrl: pdfUrl });
        console.log('Profile document created successfully!');
      } else {
        await updateDoc(userDocRef, { pdfUrl: pdfUrl });
        console.log('PDF URL updated successfully!');
      }
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
    pdfPreview: {
      width: '100%',
      height: '400px', 
      border: 'none',
      marginTop: '20px', 
    },
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
      <button
        className="custom right"
        onClick={() => document.getElementById('pdfInput').click()}
      >
        Upload PDF
      </button>
      {loading && (
        <div style={styles.loadingOverlay}>
          <Spinner animation="border" variant="light" />
        </div>
      )}

{pdfUrl && (
        <iframe
          src={pdfUrl}
          style={styles.pdfPreview}
          title="PDF Preview"
        />
      )}

    </div>
  );
};

export default PDFUpload;
