import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Import your Firebase config
import { doc, getDoc } from 'firebase/firestore';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUserId = "currentUserId"; // Replace with actual current user ID

  useEffect(() => {
    const fetchNotifications = async () => {
      const userDocRef = doc(db, 'users', currentUserId);
      
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setNotifications(userData.notifications || []); // Get notifications from user's document
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [currentUserId]);

  return (
    <div className='center mt-4'>
      <h1 className='primary'>Notifications</h1>
      <ul>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <li key={index}>{notification}</li>
          ))
        ) : (
          <li>No new notifications</li>
        )}
      </ul>
    </div>
  );
};

export default Notifications;
