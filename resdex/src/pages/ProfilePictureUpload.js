import { useState } from 'react';
import { storage, db } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Spinner from 'react-bootstrap/Spinner';

const ProfilePictureUpload = ({ user, updateProfilePicture }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // max size: 5mb for firestore db
      setSelectedFile(file);
      setErrorMessage(null);
      handleUpload(file);
    } else {
      setErrorMessage('Please select a valid image file (max 5MB).');
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
          setErrorMessage('Upload failed. Please try again.');
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Download URL:', downloadURL);

          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            await setDoc(userDocRef, { profilePicture: downloadURL });
            console.log('Profile document created successfully!');
          } else {
            await updateDoc(userDocRef, { profilePicture: downloadURL });
            console.log('Profile picture updated successfully!');
          }

          updateProfilePicture(downloadURL);
          setSelectedFile(null);
          setLoading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error updating or creating profile picture document: ', error);
      setLoading(false);
      setErrorMessage('An error occurred. Please try again.');
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
    }
  };

  return (
    <div>
      <input
        id="profilePictureInput"
        type="file"
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleProfilePictureChange}
      />
      
      
      {loading && (
        <div style={styles.loadingOverlay}>
          <Spinner animation="border" variant="light" />
        </div>
      )}

      {uploadProgress > 0 && !loading && (
        <div>
          <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>
        </div>
      )}
      
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default ProfilePictureUpload;
