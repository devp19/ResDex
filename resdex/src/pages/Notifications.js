import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsList);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.map(notification => (
        <div key={notification.id}>
          <p>{notification.message}</p>
          <small>{notification.timestamp.toDate().toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default Notifications;