import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import ProfilePictureUpload from './ProfilePictureUpload';
import PDFUpload from './PDFUpload';
// import { s3 } from '../awsConfig';
import { s3 } from '../cloudflareConfig';
import Select from 'react-select';
import Carousel from 'react-bootstrap/Carousel';
import blank from '../images/empty-pic.webp';

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
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

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
  const [contributionsCount, setContributionsCount] = useState(profileUser ? profileUser.contributions : 0);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [pdfToRemove, setPdfToRemove] = useState(null);

  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const [editedTags, setEditedTags] = useState([]);

 const [showFollowersModal, setShowFollowersModal] = useState(false);
const [followersList, setFollowersList] = useState([]);
const [followersLoading, setFollowersLoading] = useState(false);


  const interestOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Education', label: 'Education' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Law', label: 'Law' },
    { value: 'Arts', label: 'Arts' }

  ];

  useEffect(() => {
    if (profileUser) {
      setContributionsCount(profileUser.contributions || 0);
    }
  }, [profileUser]);

  const increaseContributions = async () => {
    try {
      const updatedCount = contributionsCount + 1;
      setContributionsCount(updatedCount);
  
      if (profileUser) {
        const userDocRef = doc(db, 'users', profileUser.uid);
        await updateDoc(userDocRef, { contributions: updatedCount });
        console.log("Contributions updated in Firestore.");
      }
    } catch (error) {
      console.error("Error updating contributions:", error);
    }
  };


  const fetchFollowersList = async () => {
  if (!profileUser || !profileUser.followers || profileUser.followers.length === 0) {
    setFollowersList([]);
    return;
  }
  setFollowersLoading(true);
  try {
    const followerDocs = await Promise.all(
      profileUser.followers.map(uid => getDoc(doc(db, 'users', uid)))
    );
    const followers = followerDocs
      .filter(docSnap => docSnap.exists())
      .map(docSnap => {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          fullName: data.fullName || data.displayName || data.username || "Unknown",
          username: data.username || "unknown",
          profilePicture: data.profilePicture,
          organization: data.organization || "",
        };
      });
    setFollowersList(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    setFollowersList([]);
  }
  setFollowersLoading(false);
};


const handleShowFollowersModal = () => {
  setShowFollowersModal(true);
  fetchFollowersList();
};

const goToProfile = (username) => {
  window.open(`/profile/${username}`, '_blank');
};




  const checkFollowStatus = useCallback(async () => {
    if (!currentUser || !profileUser) return;

    const profileUserRef = doc(db, 'users', profileUser.uid);
    const currentUserRef = doc(db, 'users', currentUser.uid);

    try {
      const [profileUserDoc, currentUserDoc] = await Promise.all([
        getDoc(profileUserRef),
        getDoc(currentUserRef)
      ]);

      if (profileUserDoc.exists() && currentUserDoc.exists()) {
        const profileUserData = profileUserDoc.data();
        const currentUserData = currentUserDoc.data();

        const profileUserFollowers = profileUserData.followers || [];
        const profileUserFollowing = profileUserData.following || [];

        const currentUserFollowing = currentUserData.following || [];
        const currentUserPendingRequests = currentUserData.pendingFollowRequests || [];

        setIsFollowing(currentUserFollowing.includes(profileUser.uid));

        setRequestSent(currentUserPendingRequests.includes(profileUser.uid));

        setFollowerCount(profileUserFollowers.length);
        setFollowingCount(profileUserFollowing.length);
      } else {
        setIsFollowing(false);
        setFollowerCount(0);
        setFollowingCount(0);
        setHasPendingRequest(false);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }, [currentUser, profileUser]);

  const updateProfile = useCallback(async (updates) => {
    if (!profileUser) return;
  
    try {
      const userDocRef = doc(db, 'users', profileUser.uid);
      await updateDoc(userDocRef, updates);
      console.log("Profile updated:", updates);
  
      const updatedUser = { ...profileUser, ...updates };
      setProfileUser(updatedUser);
      saveProfileToLocalStorage(username, updatedUser);
  
      if (updates.about !== undefined) setAbout(updates.about);
      if (updates.organization !== undefined) setOrganization(updates.organization);
      if (updates.interests !== undefined) {
        setInterests(updates.interests);
        setSelectedInterests(
          updates.interests.split(', ').map(i => ({ value: i, label: i }))
        );
      }
  
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }, [profileUser, username]);
  
  

  useEffect(() => {
    if (currentUser && profileUser) {
      checkFollowStatus();
    }
  }, [currentUser, profileUser, checkFollowStatus]);



  const toggleFollow = async () => {
    if (!currentUser || !profileUser || isRequestInProgress) return;
  
    setIsRequestInProgress(true);
  
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const profileUserRef = doc(db, 'users', profileUser.uid);
  
    try {
      if (isFollowing) {
        await updateDoc(currentUserRef, { following: arrayRemove(profileUser.uid) });
        await updateDoc(profileUserRef, { followers: arrayRemove(currentUser.uid) });
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
      } else if (!requestSent) {
const userDocSnap = await getDoc(currentUserRef);
const firestoreUsername = userDocSnap.exists() ? userDocSnap.data().username : null;
        const followRequest = {
          requesterId: currentUser.uid,
          fullName: currentUser.displayName,
          requesterName: firestoreUsername,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
  
        await updateDoc(currentUserRef, { pendingFollowRequests: arrayUnion(profileUser.uid) });
        await updateDoc(profileUserRef, {
          notifications: arrayUnion(followRequest),
          followRequests: arrayUnion(followRequest)
        });
  
        setRequestSent(true);
        console.log(`${currentUser.displayName} sent a follow request to ${profileUser.fullName}`);
      }
  
    } catch (error) {
      console.error("Error toggling follow status:", error);
    } finally {
      setIsRequestInProgress(false);
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
    const response = await fetch('https://resdex.onrender.com/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.uid,
        objectKey: pdfToRemove.objectKey, 
      }),
    });

    const result = await response.json();

    if (!result.success) throw new Error(result.message);

    const updatedPdfs = pdfs.filter(pdf => pdf.objectKey !== pdfToRemove.objectKey);
    await updateDoc(doc(db, 'users', currentUser.uid), { pdfs: updatedPdfs });

    setPdfs(updatedPdfs);
    if (currentPdfIndex >= updatedPdfs.length) {
      setCurrentPdfIndex(Math.max(0, updatedPdfs.length - 1));
    }

    console.log("Successfully removed PDF from both R2 and Firestore");
  } catch (error) {
    console.error("Error removing PDF:", error);
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
      setPdfs(userData.pdfs);
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
    if (!profileUser) return; // make sure profile exists otherwise it screws up idk y even tho it exists

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
    if (!profileUser) return;

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

  const handleAboutSubmit = async () => {
    const updates = {};
    if (newAbout !== about) updates.about = newAbout;
    if (newOrganization !== organization) updates.organization = newOrganization;
    const newInterestsString = selectedInterests.map(i => i.value).join(', ');
    if (newInterestsString !== interests) updates.interests = newInterestsString;
  
    if (Object.keys(updates).length > 0) {
      await updateProfile(updates);
    }
  
    setIsModalOpen(false);
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
      backgroundColor: '#1a1a1a',
      padding:'10px',
      margin: '1px',
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
        backgroundColor: '#1a1a1a',
        color: 'white',
       
      },
    }),
  };
  



  

  return (
    <div>

      
    
        <div className='row fade-in2 d-flex justify-content-center mt-3' 
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
                  borderRadius: '50%',
                  border: '1px solid white',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
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
                      objectFit: 'cover',
                      backgroundColor: 'transparent'
                    }}
                  />
                ) : (
                  <img
                    src={blank}
                    alt="Profile"
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      backgroundColor: 'transparent'
                    }}
                  />
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
  
  <div className='col-md d-flex justify-content-end mt-4' style={{maxHeight: '50px'}}>
  {!isOwnProfile && (
    <a
      className="custom-view" 
      onClick={toggleFollow}
      disabled={isRequestInProgress || requestSent}
    >
      {requestSent ? (
        <span style={{ position: 'relative', top: '7px' }}>Request Sent
         <svg style={{marginLeft: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-send-plus-fill" viewBox="0 0 16 16">
  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 1.59 2.498C8 14 8 13 8 12.5a4.5 4.5 0 0 1 5.026-4.47zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
  <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1a.5.5 0 0 0-.5-.5"/>
</svg>
        </span>
      ) : isFollowing ? (
        <span style={{ position: 'relative', top: '7px' }}>Unfollow
        <svg style={{marginLeft: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-people-fill" viewBox="0 0 16 16">
  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
</svg>
        </span>
      ) : (
        <span style={{ position: 'relative', top: '7px' }}>Follow
         <svg style={{marginLeft: '10px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-person-fill-add" viewBox="0 0 16 16">
  <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
  <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
</svg>
        </span>
      )}
    </a>
  )}
</div>

  

            </div>
           
  {/* <p className='primary'> 
   <span className='primary'><strong className='primary'>Following:</strong> {followingCount}</span>
</p> */}

  
  <p className='primary'>{about}</p>
  <div className='row d-flex justify-content-center' style={{margin: '0px'}}>
  <div className='col-md-5 box' style={{textAlign: 'left', borderLeft: '1px solid white', marginTop: '10px', marginBottom: '20px', padding: '20px', margin: '5px'}}>
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
  <div className='col-md  box' style={{textAlign: 'left', borderLeft: '1px solid white', marginTop: '10px', marginBottom: '20px', padding: '20px', margin: '5px'}}>
  <div className='row'>
  <br>
  </br>
  <div className='col-md-5' style={{borderRight: '1px solid black'}}>
    <h2 className=' primary'>{profileUser.contributions || 0} 
    </h2>
    <p className=' primary'>Contributions</p>
  </div>
  <div className='col-md offset-md-1'>
    {/* <span
  style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
  onClick={handleShowFollowersModal}
>
  {profileUser.followers ? profileUser.followers.length : 0} Research Fellows
</span> */}

    <h2 className='primary' style={{ cursor: 'pointer'}}
  onClick={handleShowFollowersModal}>{followerCount} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" class="bi bi-person-lines-fill" viewBox="0 0 16 16">
  <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"/>
</svg>
    </h2>
    <p className=' primary' >Research Fellows</p>
  </div>
    </div>
  

    {/* <button className="custom" onClick={increaseContributions}>
  Increase Contributions
</button> */}
    
  </div>
  </div>
  

  <div className='mt-5'>

        <div style={{borderRadius: '5px', margin: '0px'}} className='row d-flex justify-content-center'>

          <div className='col-md-12 box'>
            <div className='row' style={{marginTop: "-10px"}}>
<div className='col-md d-flex align-items-center'>
            <h4 className='primary'>Completed Research</h4>
            </div>
            
          <div className='col-md' style={{position: 'relative', textAlign: 'right'}}>
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
            marginBottom: '10px',
            
          }} className='row justify-content-center align-items-center'>
            {pdfs.length > 0 ? (
              <Carousel>
              {pdfs.map((pdf, index) => (
                <Carousel.Item key={index}>
                  <div style={{marginLeft:'150px',
            marginRight:'150px'}} className='d-flex  justify-content-center mb-4'>
                    <div className='row mt-3 '>
                      <div className='col-md-4'>
                        <iframe
                          title='pdf'
                          src={pdf.url}
                          style={{
                            width: '100%',
                            height: '300px',
                            border: 'none',
                            borderRadius: '5px',
                            pointerEvents: 'none',
                          }}
                        />
                      </div>
                      <div className='col-md d-flex justify-content-center align-items-top'> 
  <div className="text-white mt-3" style={{borderLeft: '1px solid #1a1a1a', paddingLeft: '30px'}}>
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
              <div className=" text-center primary" style={{marginTop: '40px'}}>
                No Documents Uploaded
              </div>
            )}
          </div>
          </div>
        </div>
 

      <Modal show={isModalOpen} onHide={handleModalClose} className='box'>
        <Modal.Header style={{background: '#e5e3df', borderBottom: '1px solid white'}} closeButton>
          <Modal.Title className='primary'>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{background: '#e5e3df', borderBottom: '1px solid white'}}>
          <div style={{borderBottom: '1px solid white', paddingBottom: '20px'}}>
           <p><strong className='primary'>About</strong></p>
          <textarea
          spellcheck="false"
            maxLength="300"
            value={newAbout}
            onChange={(e) => setNewAbout(e.target.value)}
            rows="6"
            style={{ width: '100%', color: 'black', borderRadius: '5px', resize: "none", padding:'20px' }}
          />
          </div>
          <br></br>
        
<div style={{borderBottom: '1px solid white', paddingBottom: '20px'}}>
          <p><strong className='primary'>Organization</strong></p>
          <textarea
          spellcheck="false"
            maxLength="40"
            value={newOrganization}
            onChange={(e) => setNewOrganization(e.target.value)}
            rows="1"
            style={{ width: '100%', color: 'black', borderRadius: '5px', resize: "none", padding:'20px' }}
          />
          </div>


<br></br>
<p><strong className='primary'>Interests</strong></p>
<Select
     isMulti
     name="interests"
     options={interestOptions}
     className="basic-multi-select"
     classNamePrefix="select"
     value={selectedInterests}
     rows='1'
     onChange={(selected) => {
       if (selected.length <= 3) {
         setSelectedInterests(selected);
       }
     }}
     isOptionDisabled={() => selectedInterests.length >= 3}
     placeholder="Select up to 3 interests"
     styles={customStyles}

  /><br></br>
        </Modal.Body>
        <Modal.Footer style={{background: '#e5e3df', borderBottom: '1px solid white'}}>
          <a className='custom-view'  onClick={handleModalClose}>
            Cancel
          </a>
          <a  className='custom-view' onClick={handleAboutSubmit}>
            Save
          </a>
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


      
<Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)} centered size="lg">
  <Modal.Header style={{background: '#e5e3df', borderBottom: '1px solid #2a2a2a'}} closeButton>
    <Modal.Title className='primary'>Research Fellows</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto', background: '#e5e3df', borderBottom: '1px solid #2a2a2a' }}>
    {followersLoading ? (
      <div>Loading...</div>
    ) : followersList.length === 0 ? (
      <div className='primary'>No connected research fellows.</div>
    ) : (
      followersList.map((result, index) => (
        <div
          key={index}
          className="box"
          style={{
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            background: '#e5e3df'
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center" style={{ marginRight: '30px' }}>
              <img
                src={
                  result.profilePicture ||
                  'https://firebasestorage.googleapis.com/v0/b/resdex-4b117.appspot.com/o/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.webp?alt=media&token=edabe458-161b-4a69-bc2e-630674bdb0de'
                }
                alt={`${result.fullName}'s profile`}
                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
              />
              <div>
                <strong style={{ color: 'black' }}>{result.fullName}</strong>
                <span>
                  <i style={{ color: 'gray', marginLeft: '10px' }}>'{result.username}'</i>
                </span>
                <br />
                <span>
                  {result.organization && (
                    <i style={{ color: 'gray' }}>
                      <svg
                        style={{ marginRight: '10px' }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="grey"
                        className="bi bi-buildings"
                        viewBox="0 0 16 16"
                      >
                        <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z" />
                        <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z" />
                      </svg>
                      {result.organization}
                    </i>
                  )}
                </span>
              </div>
            </div>
            <button className="custom-view" onClick={() => goToProfile(result.username)}>
              View Profile ↗︎
            </button>
          </div>
        </div>
      ))
    )}
  </Modal.Body>
  <Modal.Footer style={{background: '#e5e3df', borderBottom: '1px solid white'}}>
    {/* <Button className='custom-view' onClick={() => setShowFollowersModal(false)}>
      Close
    </Button> */}
  </Modal.Footer>
</Modal>



      
    <Modal show={showRemoveModal}  className='box' onHide={() => setShowRemoveModal(false)}>
  <Modal.Header style={{background: '#e5e3df', borderBottom: '1px solid white'}} closeButton>
    <Modal.Title style={{color: 'black'}}>Edit Document</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{background: '#e5e3df', borderBottom: '1px solid white'}}>
    <Form style={{background: '#e5e3df', borderBottom: '1px solid white'}}>
      <Form.Group className="mb-3" controlId="formDocumentTitle">
        <Form.Label className='primary'>Title</Form.Label>
        <Form.Control type="text" placeholder="Enter new title" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formDocumentDescription">
        <Form.Label className='primary'>Description</Form.Label>
        <Form.Control as="textarea" rows={3} maxLength={150} placeholder="Enter new description" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formDocumentTags">
        <Form.Label className='primary'>Related Topic</Form.Label>
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
  <Modal.Footer style={{background: '#e5e3df', borderBottom: '1px solid white'}}>
    <Button className='custom-view' onClick={confirmRemove}>
      Remove
    </Button>
    <div className="ms-auto">
      {/* <Button onClick={() => setShowRemoveModal(false)} className="me-2 custom-view">
        Cancel
      </Button> */}
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
