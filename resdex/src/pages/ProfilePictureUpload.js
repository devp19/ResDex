import { useState, useRef } from 'react';
import { storage, db } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Spinner from 'react-bootstrap/Spinner';
import { Modal } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ProfilePictureUpload = ({ user, updateProfilePicture }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState();
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height) * 0.8;
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    setCrop({
        unit: 'px',
        x,
        y,
        width: size,
        height: size,
        aspect: 1,
    });
  };
  
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
    setCrop();
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
    cropImage: {
      maxWidth: '100%',
      maxHeight: '60vh',
    },
    cropContainer: {
      position: 'relative',
      display: 'inline-block',
    }
  };

  // Add custom CSS for circular crop
  const customCropStyles = `
    .ReactCrop__crop-selection {
      border-radius: 50% !important;
      border: 2px solid #fff !important;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5) !important;
    }
    .ReactCrop__drag-handle {
      border-radius: 50% !important;
      background: #fff !important;
      border: 2px solid #2a2a2a !important;
      width: 12px !important;
      height: 12px !important;
    }
    .ReactCrop__drag-handle.ord-nw {
      top: -6px !important;
      left: -6px !important;
    }
    .ReactCrop__drag-handle.ord-ne {
      top: -6px !important;
      right: -6px !important;
    }
    .ReactCrop__drag-handle.ord-sw {
      bottom: -6px !important;
      left: -6px !important;
    }
    .ReactCrop__drag-handle.ord-se {
      bottom: -6px !important;
      right: -6px !important;
    }
  `;

  return (
    <div>
      <input
        id="profilePictureInput"
        type="file"
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleProfilePictureChange}
      />
      
      {/* Custom CSS for circular crop */}
      <style>{customCropStyles}</style>
      
      {/* Crop Modal */}
      <Modal
        show={showCropModal}
        onHide={handleCancelCrop}
        className="box"
        size="lg"
        centered
      >
        <Modal.Header
          style={{
            background: "#e5e3df",
            borderBottom: "1px solid white",
          }}
          closeButton
        >
          <Modal.Title className="primary">
            Crop Your Profile Picture
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            background: "#e5e3df",
            borderBottom: "1px solid white",
            textAlign: 'center',
          }}
        >
          {imageSrc && (
            <div style={styles.cropContainer}>
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
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          )}
          <p className="primary" style={{ marginTop: '15px', fontSize: '14px' }}>
            Drag the corners to adjust the crop area. The image will be cropped to a perfect circle.
          </p>
        </Modal.Body>
        <Modal.Footer
          style={{
            background: "#e5e3df",
            borderBottom: "1px solid white",
          }}
        >
          <a className="custom-view" onClick={handleCancelCrop}>
            Cancel
          </a>
          <a 
            className="custom-view" 
            onClick={handleCropComplete}
            style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
          >
            {loading ? 'Saving...' : 'Save & Upload'}
          </a>
        </Modal.Footer>
      </Modal>
      
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
