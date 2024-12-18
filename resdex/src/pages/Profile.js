import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import ProfilePictureUpload from './ProfilePictureUpload';
import PDFUpload from './PDFUpload';
import { s3 } from '../awsConfig';
import Select from 'react-select';
import Carousel from 'react-bootstrap/Carousel';


const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds


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
  const [isFollowing, setIsFollowing] = useState(false);
const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [about, setAbout] = useState('');
  const [organization, setOrganization] = useState('');
  const [interests, setInterests] = useState('');
  const [newOrganization, setNewOrganization] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAbout, setNewAbout] = useState('');
  const [loading, setLoading] = useState(true);
  const [pdfs, setPdfs] = useState([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [pdfToRemove, setPdfToRemove] = useState(null);

  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const [editedTags, setEditedTags] = useState([]);

  const interestOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Engineering', label: 'Engineering' },
  ];
  

  const checkFollowStatus = useCallback(async () => {
    if (!currentUser || !profileUser) return;
    
    const profileUserRef = doc(db, 'users', profileUser.uid);
  
    try {
      const profileUserDoc = await getDoc(profileUserRef);
      
      if (profileUserDoc.exists()) {
        const userData = profileUserDoc.data();
        const followers = userData.followers || [];
        const following = userData.following || [];
        
        setIsFollowing(followers.includes(currentUser.uid));
        setFollowerCount(followers.length);
        setFollowingCount(following.length);
  
        if (currentUser.uid === profileUser.uid) {
          setFollowingCount(following.length);
        } else {
          const currentUserDoc = await getDoc(profileUserRef);
          if (currentUserDoc.exists()) {
            const currentUserData = profileUserDoc.data();
            setFollowingCount((currentUserData.following || []).length);
          }
        }
      } else {
        setIsFollowing(false);
        setFollowerCount(0);
        setFollowingCount(0);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }, [currentUser, profileUser]);

  useEffect(() => {
    if (currentUser && profileUser) {
      checkFollowStatus();
    }
  }, [currentUser, profileUser, checkFollowStatus]);



  const toggleFollow = async () => {
    if (!currentUser || !profileUser) return;
  
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const profileUserRef = doc(db, 'users', profileUser.uid);
  
    try {
      if (isFollowing) {
        // Unfollowing logic (unchanged)
        await updateDoc(currentUserRef, { following: arrayRemove(profileUser.uid) });
        await updateDoc(profileUserRef, { followers: arrayRemove(currentUser.uid) });
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
      } else if (!requestSent) {
        // Create a follow request
        const followRequest = {
          requesterId: currentUser.uid,
          requesterName: currentUser.displayName,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
  
        // Add follow request notification to the profile user's notifications
        await updateDoc(profileUserRef, {
          notifications: arrayUnion(followRequest),
          followRequests: arrayUnion(followRequest)
        });
  
        setRequestSent(true);
        console.log(`${currentUser.displayName} sent a follow request to ${profileUser.fullName}`);
      }
  
      // Update following count for current user
      const updatedCurrentUser = await getDoc(currentUserRef);
      if (updatedCurrentUser.exists()) {
        const userData = updatedCurrentUser.data();
        setFollowingCount((userData.following || []).length);
      }
  
      // Update follower count for profile user
      const updatedProfileUser = await getDoc(profileUserRef);
      if (updatedProfileUser.exists()) {
        const profileData = updatedProfileUser.data();
        setFollowerCount((profileData.followers || []).length);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };
  
  
  
  
  
  
  


const handleEdit = (pdf) => {
    if (!currentUser || !profileUser || currentUser.uid !== profileUser.uid) {
      return;
    }
    setPdfToRemove(pdf);
    setEditedTitle(pdf.title);
    setEditedDescription(pdf.description);
    setEditedTags(pdf.topics ? pdf.topics.map(topic => ({ value: topic, label: topic })) : []);
    setShowRemoveModal(true);
  };

  const saveChanges = async () => {
    if (!pdfToRemove) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedPdfs = pdfs.map(pdf => 
        pdf.url === pdfToRemove.url 
          ? { 
              ...pdf, 
              title: editedTitle, 
              description: editedDescription,
              topics: editedTags.map(tag => tag.value)
            } 
          : pdf
      );
      await updateDoc(userDocRef, { pdfs: updatedPdfs });
      setPdfs(updatedPdfs);
      console.log("Successfully updated PDF in Firestore");
    } catch (error) {
      console.error("Error updating PDF:", error);
      alert("Failed to update PDF. Please try again.");
    } finally {
      setShowRemoveModal(false);
      setPdfToRemove(null);
    }
  };

const confirmRemove = async () => {
  if (!pdfToRemove) return;

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
  } finally {
    setShowRemoveModal(false);
    setPdfToRemove(null);
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
        setOrganization(userData.organization || '');
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
    window.location.reload();
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
    const currentInterests = interests
        ? interests.split(', ').map(interest => ({ value: interest, label: interest }))
        : [];
    setSelectedInterests(currentInterests);
    setIsModalOpen(true);
  };
  

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAboutSubmit = () => {
    if(newAbout !== about){
      updateAbout(newAbout);
    }
    if(newOrganization !== organization){
      updateOrganization(newOrganization);
    }
    const newInterestsString = selectedInterests.map(i => i.value).join(', ');
    if (newInterestsString !== interests) {
      updateInterests(selectedInterests);
    }    setIsModalOpen(false);
  };

  if (loading) {
    return <p className='primary'>Loading...</p>;
  }

  if (!profileUser) {
    return <p>User not found.</p>;
  }

  

  const isOwnProfile = currentUser && currentUser.uid === profileUser.uid;

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
      padding:'5px',
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
    
        <div className='row d-flex justify-content-center mt-3' 
               style={{marginBottom: '20px'}}>


          <div className='row d-flex justify-content-center'>
          
          <div className='col-md-9 box' style={{padding: '20px'}}>
          <div className='row d-flex justify-content-center'>
            <div className='col'>

            <div className='col-md' style={{position:'relative', textAlign: 'right'}}>                    
                  {isOwnProfile && (
                      <button className='custom-edit' onClick={handleModalOpen}> 
                      <svg style={{marginRight: '14px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="bi bi-pencil-square" fill="white" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>
Edit Profile
                      </button>
                    )
                    }
              </div>
              </div>

        
          
          </div>
              <div 
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '5%',
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
                      // borderRadius: '50%',
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

            <div className='row'>
              <div className='col-md'>

         
            <h1 className='primary mt-4'>{profileUser.fullName}
    {(username === "dev" || username === "fenil" || username === "deep" || username === "rishi" || username === "bhavi") && (
        <svg style={{ marginLeft: '20px' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" className="bi bi-patch-check-fill" viewBox="0 0 16 16" title="Verified user">
          <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
        </svg>
    )}

  </h1>
  </div>

<div className='col-md d-flex justify-content-end align-items-center '>
{!isOwnProfile && (
  <button 
    className="custom-edit" 
    onClick={toggleFollow}
    disabled={requestSent}
  >
    {isFollowing ? (
      <p style={{ position: 'relative', top: '7px' }}>
        Unfollow  
        <svg style={{marginLeft: '30px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-dash-fill" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M11 7.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/>
          <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
        </svg>
      </p>
    ) : requestSent ? (
      <p style={{ position: 'relative', top: '7px' }}>
        Request Sent
        <svg style={{marginLeft: '30px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
        </svg>
      </p>
    ) : (
      <p style={{ position: 'relative', top: '7px' }}>
        Follow  
        <svg style={{marginLeft: '30px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-plus-fill" viewBox="0 0 16 16">
          <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
          <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
        </svg>
      </p>
    )}
  </button>
)}

</div>

            </div>
           
  <p className='primary'> <strong className='primary'>Followers:</strong> {followerCount}
   <span className='primary' style={{marginLeft: '40px'}}><strong className='primary'>Following:</strong> {followingCount}</span>
</p>

  
  <p className='primary' style={{marginTop: '20px'}}>{about}</p>
  <div className='col-md-12 box' style={{textAlign: 'left', borderLeft: '1px solid white', marginTop: '30px', marginBottom: '20px', padding: '20px'}}>
    {organization && (
      <p className='primary'>
        <svg style={{marginRight: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-buildings" viewBox="0 0 16 16">
          <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z"/>
          <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z"/>
        </svg>
        {organization}
      </p>
    )}

    {interests && interests.length > 0 && (
      <div>
        <svg style={{marginRight: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-tags-fill" viewBox="0 0 16 16">
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

  <div className='mt-5'>

        <div style={{borderRadius: '5px', margin: '0px'}} className='row d-flex justify-content-center'>

          <div className='col-md-12 box'>
            <div className='row'>
<div className='col d-flex align-items-center'>
            <h4 className='monarque primary'>Completed Research</h4>
            </div>
            
          <div className='col' style={{position: 'relative', textAlign: 'right'}}>
          {isOwnProfile && (
                      <PDFUpload user={currentUser} onUploadComplete={() => fetchPDFs(currentUser.uid)} />
                    )
                    }
                    </div>
         
          </div>
          <div style={{
            borderRadius: '5px',
            padding: '20px',
            paddingBottom: '50px',
            border: '1px solid white',
            marginBottom: '10px'
          }} className='col-md-12 justify-content-center align-items-center'>
            {pdfs.length > 0 ? (
              <Carousel>
              {pdfs.map((pdf, index) => (
                <Carousel.Item key={index}>
                  <div className='d-flex justify-content-center'>
                    <div className='row'>
                      <div className='col-md-4'>
                        <iframe
                          title='pdf'
                          src={pdf.url}
                          style={{
                            width: '100%',
                            height: '300px',
                            border: 'none',
                            borderRadius: '5px',
                            pointerEvents: 'none'
                          }}
                        />
                      </div>
                      <div className='col-md-7 d-flex flex-column align-items-center'>
  <div className="text-white mt-3">
    <h5 className='primary'>{pdf.title}</h5>
    <p className='primary'>{pdf.description}</p>
    {pdf.topics && pdf.topics.length > 0 && (
      <div style={{ marginBottom: '10px' }}>
        <svg style={{marginRight: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-tags-fill" viewBox="0 0 16 16">
          <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
          <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
        </svg>
        {pdf.topics.map((topic, index) => (
          <span key={index} className="interest-pill">
            {topic}
          </span>
        ))}
      </div>
    )}
    <button className="custom" style={{marginRight: '10px'}} onClick={() => window.open(pdf.url, '_blank')}>
      View ⇗
    </button>
    {isOwnProfile && (
      <button className="custom" onClick={() => handleEdit(pdf)}>
        Edit Paper
      </button>
    )}
  </div>
</div>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
            
            ) : (
              <div className="d-flex align-items-center justify-content-center text-white top" style={{marginTop: '10px'}}>
                No Documents Uploaded
              </div>
            )}
          </div>
          </div>
        </div>
 

      <Modal show={isModalOpen} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{color: 'black'}}>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong style={{color: 'black'}}>About</strong></p>
          <textarea
            maxLength="300"
            value={newAbout}
            onChange={(e) => setNewAbout(e.target.value)}
            rows="6"
            style={{ width: '100%', color: 'black', borderRadius: '5px', resize: "none", padding:'20px' }}
          />
          <br></br>
          <br></br>

          <p><strong style={{color: 'black'}}>Organization</strong></p>
          <textarea
            maxLength="40"
            value={newOrganization}
            onChange={(e) => setNewOrganization(e.target.value)}
            rows="1"
            style={{ width: '100%', color: 'black', borderRadius: '5px', resize: "none", padding:'20px' }}
          />

<br></br>
<br></br>
<p><strong style={{color: 'black'}}>Interests</strong></p>
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
            </div>
</div>



          <div className='col'>
            
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


      

      
    <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title style={{color: 'black'}}>Edit Document</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{color: 'black'}}>
    <Form>
      <Form.Group className="mb-3" controlId="formDocumentTitle">
        <Form.Label><strong style={{color: 'black'}}>Document Title</strong></Form.Label>
        <Form.Control type="text" placeholder="Enter new title" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formDocumentDescription">
        <Form.Label><strong style={{color: 'black'}}>Document Description</strong></Form.Label>
        <Form.Control as="textarea" rows={3} placeholder="Enter new description" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formDocumentTags">
        <Form.Label><strong style={{color: 'black'}}>Related Topic</strong></Form.Label>
        <Select
          isMulti
          name="tags"
          options={interestOptions}
          className="basic-multi-select"
          classNamePrefix="select"
          value={editedTags}
          onChange={(selected) => {
            if (selected.length <= 3) {
              setEditedTags(selected);
            }
          }}
          isOptionDisabled={() => editedTags.length >= 3}
          placeholder="Select a topic!"
          styles={customStyles}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button className='custom-view' onClick={confirmRemove}>
      Remove
    </Button>
    <div className="ms-auto">
      <Button variant="secondary" onClick={() => setShowRemoveModal(false)} className="me-2">
        Cancel
      </Button>
      <Button className='custom-view' onClick={saveChanges}>
        Save Changes
      </Button>
    </div>
  </Modal.Footer>
</Modal>
    </div>
  );

};


export default Profile;
