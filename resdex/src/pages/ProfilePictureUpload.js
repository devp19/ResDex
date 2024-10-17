// In ProfilePictureUpload.js
import { useState } from 'react';
import { storage, db } from '../firebaseConfig'; // Import storage and db
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

const ProfilePictureUpload = ({ user }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

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
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // Update the user's profile picture in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          updateDoc(userDocRef, { profilePicture: downloadURL })
            .then(() => {
              console.log('Profile picture updated successfully!');
              // You might want to update the profilePicture state in the parent component here
            })
            .catch((error) => {
              console.error('Error updating profile picture in Firestore: ', error);
            });
        });
      }
    );
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {uploadProgress > 0 && <p>Upload progress: {uploadProgress}%</p>}
    </div>
  );
};

export default ProfilePictureUpload;
