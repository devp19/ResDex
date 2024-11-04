import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import ProfilePictureUpload from './ProfilePictureUpload';
import PDFUpload from './PDFUpload';
import { s3 } from '../awsConfig';
import Select from 'react-select';


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
  const [organization, setOrganization] = useState('');
  const [interests, setInterests] = useState('');
  const [newOrganization, setNewOrganization] = useState('');
  const [newInterests, setNewInterests] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAbout, setNewAbout] = useState('');
  const [loading, setLoading] = useState(true);
  const [pdfs, setPdfs] = useState([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false); // check hovering for profile pic update so user can changeeee
  const [selectedInterests, setSelectedInterests] = useState([]);
  

  const interestOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Engineering', label: 'Engineering' },
  ];
  
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
        setOrganization(cachedProfile.organization || '');
        setInterests(cachedProfile.interests || '');
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
        setOrganization('');
        setInterests('');
      } else {
        const userData = userDocSnapshot.data();
        console.log("Full user data:", userData);
        setProfileUser(userData);
        setProfilePicture(userData.profilePicture || null);
        setAbout(userData.about || '');
        setOrganization(userData.about || '');
        setInterests(userData.interests || '');
        const interestsArray = userData.interests ? userData.interests.split(', ') : [];
        setSelectedInterests(interestsArray.map(interest => ({ value: interest, label: interest })));
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

  const updateOrganization = useCallback(async (newOrganizationSection) => {
    if (!profileUser) return; // make sure profile exists otherwise, its screwed up

    setOrganization(newOrganizationSection);
    const updatedUser = { ...profileUser, organization: newOrganizationSection };
    saveProfileToLocalStorage(username, updatedUser);
    setProfileUser(updatedUser);

    try {
        const userDocRef = doc(db, 'users', profileUser.uid);
        await updateDoc(userDocRef, { organization: newOrganizationSection });
        console.log("Organization section updated in Firestore.");
    } catch (error) {
        console.error("Error updating organization section in Firestore: ", error);
    }
}, [username, profileUser]);


const updateInterests = useCallback(async (newInterests) => {
  if (!profileUser) return;
  const interestValues = newInterests.map(interest => interest.value);
  setSelectedInterests(newInterests);
  const updatedUser = { ...profileUser, interests: interestValues.join(', ') };
  saveProfileToLocalStorage(username, updatedUser);
  setProfileUser(updatedUser);
  try {
    const userDocRef = doc(db, 'users', profileUser.uid);
    await updateDoc(userDocRef, { interests: interestValues.join(', ') });
    console.log("Interests updated in Firestore.");
  } catch (error) {
    console.error("Error updating interests in Firestore: ", error);
  }
}, [username, profileUser]);




  const handleProfilePictureClick = () => {
    document.getElementById('profilePictureInput').click();
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const handleModalOpen = () => {
    setNewAbout(about);
    setNewOrganization(organization);
    const currentInterests = interests.split(', ').map(interest => ({
      value: interest,
      label: interest
    }));
    setSelectedInterests(currentInterests);
    setIsModalOpen(true);
  };
  

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAboutSubmit = () => {
    if(newAbout != about){
      updateAbout(newAbout);
    }
    if(newOrganization != organization){
      updateOrganization(newOrganization);
    }
    const newInterestsString = selectedInterests.map(i => i.value).join(', ');
    if (newInterestsString !== interests) {
      updateInterests(selectedInterests);
      window.location.reload();
    }    setIsModalOpen(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!profileUser) {
    return <p>User not found.</p>;
  }

  

  const isOwnProfile = currentUser && currentUser.uid === profileUser.uid;
  const isOptionDisabled = (option) => selectedInterests.length >= 3;

  const handleInterestsChange = (selected) => {
    if (selected.length <= 3) {
      setSelectedInterests(selected);
    }
  };


  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'white' : 'black',
      backgroundColor: state.isSelected ? 'rgba(189,197,209,.3)' : 'white', // random light grey colr (color picksd it)
      '&:hover': {
        backgroundColor: 'rgba(189,197,209,.3)',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'black',
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
      <div className='center top'>
        <div className='row'>
          <div className='d-flex justify-content-center' 
               style={{marginBottom: '20px'}}>
            <label className='col-md-5'>
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
            <label className='offset-md-1 col-md-4'></label>
          </div>
          <div className='col'>
            <div className='row d-flex justify-content-center'>
  <h1 className='col-md-5'>{profileUser.fullName}
    {(username === "dev" || username === "fenil" || username === "deep" || username === "rishi" || username === "bhavi") && (
        <svg style={{ marginLeft: '20px' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-patch-check-fill" viewBox="0 0 16 16" title="Verified user">
          <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
        </svg>
      
    )}
    

  </h1>
  <label className='offset-md-1 col-md-4'>
  <div style={{textAlign: 'right'}}>                    
                  {isOwnProfile && (
                      <button className='custom-edit' onClick={handleModalOpen}> 
                      <svg style={{marginRight: '14px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="bi bi-pencil-square" fill="black" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>
Edit Profile
                      </button>
                    )
                    }
              </div>
  </label>

</div>

<div className='row d-flex justify-content-center'>
  <div className='col-md-5'>
    <p>{about}</p>
    </div>
    <div className='offset-md-1 col-md-4' style={{textAlign: 'right', borderLeft: '1px solid white'}}>
    {organization && (
      <p>
        <svg style={{marginRight: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-buildings" viewBox="0 0 16 16">
          <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z"/>
          <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z"/>
        </svg>
        {organization}
      </p>
    )}

    {interests && interests.length > 0 && (
      <div>
        <svg style={{marginRight: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-tags-fill" viewBox="0 0 16 16">
          <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
          <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
        </svg>
        {interests.split(', ').map((interest, index) => (
          <span key={index} className="interest-pill">
            {interest}
          </span>
        ))}
      </div>
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
                {isOwnProfile && (
              <button 
                  className="custom"
                  onClick={() => handleRemove(pdfs[currentPdfIndex])}
                > Remove Paper </button>
                )}
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

      <Modal show={isModalOpen} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{color: 'black'}}>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong style={{color: 'black'}}>Edit About</strong></p>
          <textarea
            maxLength="300"
            value={newAbout}
            onChange={(e) => setNewAbout(e.target.value)}
            rows="4"
            style={{ width: '100%', color: 'black', borderRadius: '5px', resize: "none" }}
          />
          <br></br>
          <br></br>

          <p><strong style={{color: 'black'}}>Edit Organization</strong></p>
          <textarea
            maxLength="40"
            value={newOrganization}
            onChange={(e) => setNewOrganization(e.target.value)}
            rows="1"
            style={{ width: '100%', color: 'black', borderRadius: '5px', resize: "none" }}
          />

<br></br>
<br></br>
<p><strong style={{color: 'black'}}>Edit Interests</strong></p>
<Select
     isMulti
     name="interests"
     options={interestOptions}
     className="basic-multi-select"
     classNamePrefix="select"
     value={selectedInterests}
     onChange={(selected) => {
       if (selected.length <= 3) {
         setSelectedInterests(selected);
       }
     }}
     isOptionDisabled={() => selectedInterests.length >= 3}
     placeholder="Select up to 3 interests"
     styles={customStyles}

  />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" className='custom-view' onClick={handleAboutSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      
    </div>
  );

};


export default Profile;
