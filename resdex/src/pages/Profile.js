import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import ProfilePictureUpload from './ProfilePictureUpload';
import PDFUpload from './PDFUpload';
import { s3 } from '../awsConfig';

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

const saveProfileToLocalStorage = (username, profileData) => {
  const dataToStore = {
    profile: profileData,
    timestamp: Date.now()
  };
  localStorage.setItem(`profile_${username}`, JSON.stringify(dataToStore));
};

const getProfileFromLocalStorage = (username) => {
  const storedData = localStorage.getItem(`profile_${username}`);
  if (storedData) {
    const { profile, timestamp } = JSON.parse(storedData);
    if (Date.now() - timestamp < CACHE_EXPIRATION) {
      return profile;
    }
  }
  return null;
};

const Profile = () => {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [about, setAbout] = useState('');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAbout, setNewAbout] = useState('');
  const [isHovering, setIsHovering] = useState(false); // check hovering for profile pic update so user can changeeee
  const [pdfs, setPdfs] = useState([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);

const nextPdf = () => {
  if (currentPdfIndex < pdfs.length - 1) {
    setCurrentPdfIndex(currentPdfIndex + 1);
  }
};

const previousPdf = () => {
  if (currentPdfIndex > 0) {
    setCurrentPdfIndex(currentPdfIndex - 1);
  }
};

const handleRemove = async (pdfToRemove) => {
  if (!currentUser || !profileUser || currentUser.uid !== profileUser.uid) {
    return;
  }

  try {
    const key = decodeURIComponent(pdfToRemove.url.split('resdex-bucket.s3.amazonaws.com/')[1]);
    console.log(key);
    console.log("Attempting to delete object with key:", key);
    
    const params = { Bucket: 'resdex-bucket', Key: key };
    await s3.deleteObject(params).promise();

    const userDocRef = doc(db, 'users', currentUser.uid);
    const updatedPdfs = pdfs.filter(pdf => pdf.url !== pdfToRemove.url);
    await updateDoc(userDocRef, { pdfs: updatedPdfs });

    setPdfs(updatedPdfs);
    if (currentPdfIndex >= updatedPdfs.length) {
      setCurrentPdfIndex(Math.max(0, updatedPdfs.length - 1));
    }

    console.log("Successfully removed PDF from both S3 and Firestore");

  } catch (error) {
    console.error("Error removing PDF:", error);
    console.error("Full error details:", error.message);
    alert("Failed to remove PDF. Please try again.");
  }
};
  
const fetchPDFs = useCallback(async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    
    if (userData && userData.pdfs && userData.pdfs.length > 0) {
      const validPdfs = [];
      
      for (const pdfData of userData.pdfs) {
        try {
          const response = await fetch(pdfData.url, { method: 'HEAD' });
          if (response.ok) {
            validPdfs.push(pdfData);
          }
        } catch (error) {
          console.error("PDF no longer exists:", error);
        }
      }

      if (validPdfs.length !== userData.pdfs.length) {
        await updateDoc(userDocRef, { pdfs: validPdfs });
      }

      setPdfs(validPdfs);
    } else {
      setPdfs([]);
    }
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    setPdfs([]);
  }
}, []);

  const fetchProfileData = useCallback(async () => {

    try {
      const cachedProfile = getProfileFromLocalStorage(username);
      if (cachedProfile) {
        console.log("Profile found in local storage");
        setProfileUser(cachedProfile);
        setAbout(cachedProfile.about || '');
        setProfilePicture(cachedProfile.profilePicture || null);
        setLoading(false);
        return;
      }
      if (cachedProfile && cachedProfile.uid) {
        await fetchPDFs(cachedProfile.uid);
      }

      const usernamesRef = collection(db, 'usernames');
      const q = query(usernamesRef, where('username', '==', username.toLowerCase()));        
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('Username not found');
        setProfileUser(null);
        setLoading(false);
        return;
      }

      const userId = querySnapshot.docs[0].data().userId;
      const userDocRef = doc(db, 'users', userId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        console.log("User document does not exist");
        setProfileUser(null);
        setAbout('');
      } else {
        const userData = userDocSnapshot.data();
        console.log("Full user data:", userData);
        setProfileUser(userData);
        setProfilePicture(userData.profilePicture || null);
        setAbout(userData.about || '');
        saveProfileToLocalStorage(username, userData);
        await fetchPDFs(userData.uid);

      }
    } catch (error) {
      console.error("Error fetching profile data: ", error);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  }, [username, fetchPDFs]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    if (profileUser && profileUser.uid) {
      fetchPDFs(profileUser.uid);
    }
  }, [profileUser, fetchPDFs]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);


  const updateProfilePicture = useCallback((newPictureUrl) => {
    setProfilePicture(newPictureUrl);
    setProfileUser(prev => {
      if (prev) {
        const updatedUser = { ...prev, profilePicture: newPictureUrl };
        saveProfileToLocalStorage(username, updatedUser);
        return updatedUser;
      }
      return null;
    });
  }, [username]);

  const updateAbout = useCallback(async (newAboutSection) => {
    if (!profileUser) return; // make sure profile exists otherwise, its screwed up

    setAbout(newAboutSection);
    const updatedUser = { ...profileUser, about: newAboutSection };
    saveProfileToLocalStorage(username, updatedUser);
    setProfileUser(updatedUser);

    try {
        const userDocRef = doc(db, 'users', profileUser.uid);
        await updateDoc(userDocRef, { about: newAboutSection });
        console.log("About section updated in Firestore.");
    } catch (error) {
        console.error("Error updating about section in Firestore: ", error);
    }
}, [username, profileUser]);


  const handleAboutSubmit = () => {
    updateAbout(newAbout);
    setIsEditingAbout(false);
  };

  const handleProfilePictureClick = () => {
    document.getElementById('profilePictureInput').click();
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!profileUser) {
    return <p>User not found.</p>;
  }

  const isOwnProfile = currentUser && currentUser.uid === profileUser.uid;

 

  return (
    <div>
      <div className='center top'>
        <div className='row d-flex justify-content-center'>
          <div className='col-md-3 offset-md-2 d-flex justify-content-center' 
               style={{borderRight: '1px solid white', marginRight: '50px'}}>
            <label>
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#ccc',
                  cursor: isOwnProfile ? 'pointer' : 'default',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={isOwnProfile ? handleProfilePictureClick : undefined}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '150px',
                      height: '150px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    No Image
                  </div>
                )}
                {isOwnProfile && isHovering && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    Change Picture
                  </div>
                )}
              </div>
            </label>
          </div>
          <div className='col-md'>
            <div className='row'>
  <h1>{profileUser.fullName}
    {(username === "dev" || username === "fenil" || username === "deep" || username === "rishi" || username === "bhavi" || username === "tirth") && (
        <svg style={{ marginLeft: '20px' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-patch-check-fill" viewBox="0 0 16 16" title="Verified user">
          <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
        </svg>
      
    )}
  </h1>
</div>

            <div className='row'>
              <div className='col-md-8'>
                {isEditingAbout ? (
                  <>
                    <textarea
                      maxLength="150"
                      value={newAbout}
                      onChange={(e) => setNewAbout(e.target.value)}
                      rows="4"
                      style={{ width: '100%', color: 'black', borderRadius: '5px', resize: "none" }}
                    />
                    <button className='custom' onClick={handleAboutSubmit}>Save About</button>
                    <button className='custom border' style={{ marginLeft: '10px', background: 'black', color: 'white' }} onClick={() => setIsEditingAbout(false)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p>{about}</p>
                    {isOwnProfile && (
                      <button className='custom' onClick={() => {
                        setNewAbout(about);
                        setIsEditingAbout(true);
                      }}>
                        Edit About
                      </button>
                    )}
                  </>
                )}
              </div>

              {isOwnProfile && (
                <>
                  <ProfilePictureUpload
                    user={currentUser}
                    updateProfilePicture={updateProfilePicture}
                    id="profilePictureInput"
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>
            
          </div>

       
        <div className='container upload-cont'>
  <h4 style={{marginTop: '-20px', marginBottom: '30px'}}> Completed Research</h4>

  <div style={{borderRadius: '5px'}} className='row d-flex justify-content-center bg-white'>
  <div style={{
    margin: '10px',
    minHeight: '300px',
    borderRadius: '5px',
    padding: '20px'
  }} className='col-md-7 bg-black'>
    {pdfs.length > 0 ? (
      <div className="d-flex flex-column h-100">
        <div className="d-flex align-items-center" style={{ height: '100%' }}>
          {currentPdfIndex > 0 && (
            <button 
            onClick={previousPdf}
            className="btn btn-link"
            style={{ 
              position: 'absolute', 
              left: '50px',
              color: 'white',
              backgroundColor: 'black',
              borderRadius: '50%',
              width: '30px',
              textDecoration: 'none',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              border: 'none'
            }}
          >
            ←
          </button>
          )}
          
          <div className='row' style={{ width: '100%' }}>
            <div className='col-md-5'>
            <iframe 
              src={pdfs[currentPdfIndex].url}
              style={{
                width: '100%',
                height: '300px',
                border: 'none',
                borderRadius: '5px',
                pointerEvents: 'none'
              }}
            />
            </div>
            <div className='col-md-7'>

            <div className="text-white mt-3">
              <h5>{pdfs[currentPdfIndex].title}</h5>
              <p>{pdfs[currentPdfIndex].description}</p>
              <button 
                  className="custom"
                  onClick={() => window.open(pdfs[currentPdfIndex].url, '_blank')}
                > View Full Paper ⇗</button>
                <br></br>
              <button 
                  className="custom"
                  onClick={() => handleRemove(pdfs[currentPdfIndex])}
                > Remove Paper </button>
            </div>
            </div>
          </div>

          {currentPdfIndex < pdfs.length - 1 && (
            <button 
            onClick={nextPdf}
            className="btn btn-link"
            style={{ 
              position: 'absolute', 
              right: '50px',
              color: 'white',
              backgroundColor: 'black',
              textDecoration: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              border: 'none'
            }}
            >
              →
            </button>
          )}
        </div>
      </div>
    ) : (
      <div className="d-flex align-items-center justify-content-center h-100 text-white">
        No Documents Uploaded
      </div>
    )}
  </div>
  
    {isOwnProfile && (
      <div style={{alignSelf: 'center', height: '300px', borderRadius: '5px', marginLeft: '20px'}} 
      className='col-md-3 bg-black d-flex align-items-center justify-content-center'>
      <PDFUpload user={currentUser} onUploadComplete={() => fetchPDFs(currentUser.uid)} />
      </div>
    )}
</div>
</div>
       
        </div>

      </div>
    </div>
  );

};


export default Profile;
