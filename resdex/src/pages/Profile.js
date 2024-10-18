import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, doc, getDoc } from 'firebase/firestore';
import ProfilePictureUpload from './ProfilePictureUpload';
import PDFUpload from './PDFUpload';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userId = user.uid;

        const cachedProfilePicture = localStorage.getItem(`profilePicture_${userId}`);

        if (cachedProfilePicture) {
          setProfilePicture(cachedProfilePicture); 
          console.log("Got from local storage!") // testing purpose, just chcking if fetching picture from local storage.
          setLoading(false);
        } else {
          try {
            const userDocRef = doc(collection(db, 'users'), userId);
            const docSnapshot = await getDoc(userDocRef);

            if (docSnapshot.exists()) {
              const picture = docSnapshot.data().profilePicture;
              setProfilePicture(picture);
              localStorage.setItem(`profilePicture_${userId}`, picture);
              console.log("Got from Firestore db!") // making sure on login ALWAYS getting from firestore db.
            }
          } catch (error) {
            console.error("Error fetching document: ", error);
          } finally {
            setLoading(false);
          }
        }
      } else {
        localStorage.removeItem(`profilePicture_${user?.uid}`); // removing item from localstorage to help with caching...
        setUser(null);
        setProfilePicture(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateProfilePicture = (newPictureUrl) => {
    setProfilePicture(newPictureUrl);
    if (user) {
      localStorage.setItem(`profilePicture_${user.uid}`, newPictureUrl);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {user ? (
        <>
          <h1>Welcome, {user.displayName}!</h1>
          {profilePicture && (
            <img
              src={profilePicture}
              alt="Profile"
              style={{ width: '150px', height: '150px', borderRadius: '50%' }}
            />
          )}
          <ProfilePictureUpload 
            user={user} 
            updateProfilePicture={updateProfilePicture}
          />
          <PDFUpload user={user} />
        </>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default Profile;