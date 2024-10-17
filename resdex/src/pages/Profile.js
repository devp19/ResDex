import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, doc, getDoc } from 'firebase/firestore';
import ProfilePictureUpload from './ProfilePictureUpload';
import PDFUpload from './PDFUpload';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const userId = user.uid;
        const userDocRef = doc(collection(db, 'users'), userId);


        getDoc(userDocRef).then((doc) => {
          if (doc.exists()) {
            setProfilePicture(doc.data().profilePicture);
          } else {
            console.log("No such document!");
          }
        }).catch((error) => {
          console.error("Error fetching user document: ", error);
        });
      } else {
        setUser(null);
        setProfilePicture(null);
      }
    });

    return () => unsubscribe();
  }, []);

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
          <ProfilePictureUpload user={user} />
          
     
          <PDFUpload user={user} />
          
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
