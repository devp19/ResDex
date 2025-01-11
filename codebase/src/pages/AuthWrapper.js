// src/AuthWrapper.js

import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const storeUserDataInFirestore = async () => {
      if (isAuthenticated && user) {
        const uid = user.sub; // Auth0 user ID
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const userMetadata = user['https://your-app-domain.com/user_metadata'];
          const username =
            userMetadata?.display_name ||
            user.nickname ||
            user.email.split('@')[0];
          const usernameNormalized = username.toLowerCase().replace(/\s+/g, '');

          // Check if username already exists
          const usernameQuery = query(
            collection(db, 'usernames'),
            where('username', '==', usernameNormalized)
          );
          const usernameQuerySnapshot = await getDocs(usernameQuery);

          if (!usernameQuerySnapshot.empty) {
            console.error('Username already exists.');
            // Handle username conflict (e.g., redirect to a username change page)
            // For now, we can redirect to an error page or notify the user
            navigate('/username-conflict');
            return;
          }

          // Store user data in 'users' collection
          await setDoc(userRef, {
            uid: uid,
            fullName: userMetadata?.full_name || user.name || '',
            displayName: usernameNormalized,
            email: user.email,
            profilePicture: user.picture || null,
            username: usernameNormalized,
            contributions: 0,
          });

          // Store username in 'usernames' collection
          await setDoc(doc(db, 'usernames', usernameNormalized), {
            username: usernameNormalized,
            userId: uid,
          });

          console.log('User data stored in Firestore');
        }
      }
    };

    if (!isLoading) {
      storeUserDataInFirestore();
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return <>{children}</>;
};

export default AuthWrapper;