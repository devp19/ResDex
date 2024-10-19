import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import ProfilePictureUpload from './ProfilePictureUpload';
import PDFUpload from './PDFUpload';

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
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    try {      
      //  --> pls work cuz this is like the 5th hour trying to do this... (checking local storage)
      const cachedProfile = getProfileFromLocalStorage(username);
      if (cachedProfile) {
        console.log("Profile found in local storage");
        setProfileUser(cachedProfile);
        setProfilePicture(cachedProfile.profilePicture || null);
        setLoading(false);
        return;
      }

      // If not in local storage, fetch from Firestore db (DOC READ SAIVING THIS WAY)
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
      } else {
        const userData = userDocSnapshot.data();
        console.log("Full user data:", userData);
        setProfileUser(userData);
        setProfilePicture(userData.profilePicture || null);
        console.log("Got from firestore")
        
        // Save to local storage
        saveProfileToLocalStorage(username, userData);
      }
    } catch (error) {
      console.error("Error fetching profile data: ", error);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!profileUser) {
    return <p>User not found.</p>;
  }

  const isOwnProfile = currentUser && currentUser.uid === profileUser.uid;

  return (
    <div>
      <h1>Profile of {profileUser.fullName}</h1>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt="Profile"
          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          No Image
        </div>
      )}

      {isOwnProfile && (
        <ProfilePictureUpload 
          user={currentUser} 
          updateProfilePicture={updateProfilePicture}
        />
      )}

      {isOwnProfile && <PDFUpload user={currentUser} />}
      
    </div>
  );
};

export default Profile;