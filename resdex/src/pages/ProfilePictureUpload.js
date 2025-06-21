import { useState, useRef } from 'react';
import { storage, db } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Spinner from 'react-bootstrap/Spinner';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ProfilePictureUpload = ({ user, updateProfilePicture }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1
  });
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file);
      setErrorMessage(null);
      
      // Create a preview URL for cropping
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMessage('Please select a valid image file (max 5MB).');
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current) return;

    try {
      setLoading(true);
      const croppedImageBlob = await getCroppedImg(imgRef.current, crop);
      
      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], selectedFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Close crop modal
      setShowCropModal(false);
      setImageSrc(null);
      
      // Upload the cropped image
      await handleUpload(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
      setErrorMessage('Error cropping image. Please try again.');
      setLoading(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setImageSrc(null);
    setSelectedFile(null);
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      aspect: 1
    });
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
    },
    cropModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1001,
    },
    cropContainer: {
      backgroundColor: '#e5e3df',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'auto',
    },
    cropImage: {
      maxWidth: '100%',
      maxHeight: '60vh',
    },
    cropButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '20px',
    },
    cropButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: '#2a2a2a',
      color: 'white',
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
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
      
      {/* Crop Modal */}
      {showCropModal && imageSrc && (
        <div style={styles.cropModal}>
          <div style={styles.cropContainer}>
            <h4 style={{ color: 'black', textAlign: 'center', marginBottom: '20px' }}>
              Crop Your Profile Picture
            </h4>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                style={styles.cropImage}
              />
            </ReactCrop>
            <div style={styles.cropButtons}>
              <button
                style={{ ...styles.cropButton, ...styles.saveButton }}
                onClick={handleCropComplete}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save & Upload'}
              </button>
              <button
                style={{ ...styles.cropButton, ...styles.cancelButton }}
                onClick={handleCancelCrop}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
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
