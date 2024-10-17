import { useState } from 'react';
import { storage, db } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const ProfilePictureUpload = ({ user }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

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
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const userDocRef = doc(db, 'users', user.uid);

          // Check if the document exists; if not, create it
          const docSnapshot = await getDoc(userDocRef);
          if (!docSnapshot.exists()) {
            await setDoc(userDocRef, { profilePicture: downloadURL });
            console.log('Profile document created successfully!');
          } else {
            await updateDoc(userDocRef, { profilePicture: downloadURL });
            console.log('Profile picture updated successfully!');
          }
        } catch (error) {
          console.error('Error updating or creating profile picture document: ', error);
        }
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
