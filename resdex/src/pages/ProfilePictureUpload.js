import { useState } from 'react';
import { storage, db } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Spinner from 'react-bootstrap/Spinner';

const ProfilePictureUpload = ({ user }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (file) => {
    try {
      if (!file) return;
      setLoading(true);
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading file: ', error);
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const userDocRef = doc(db, 'users', user.uid);
  
          const docSnapshot = await getDoc(userDocRef);
          if (!docSnapshot.exists()) {
            await setDoc(userDocRef, { profilePicture: downloadURL });
            console.log('Profile document created successfully!');
          } else {
            await updateDoc(userDocRef, { profilePicture: downloadURL });
            console.log('Profile picture updated successfully!');
            window.location.reload(); // Reload to display the new profile picture
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error updating or creating profile picture document: ', error);
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
  };
  

  return (
    <div>
      <input
        id="fileInput"
        type="file"
        style={{ display: 'none' }} // Hide the file input
        onChange={handleFileChange}
      />
      <button
        className="custom right"
        onClick={() => document.getElementById('fileInput').click()}
      >
        Upload Picture
      </button>
      {loading && (
        <div style={styles.loadingOverlay}>
          <Spinner animation="border" variant="light" />
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
