import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserId(user.uid); 
      } else {
        setCurrentUserId(null); 
      }
    });

    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUserId) return;

      const userDocRef = doc(db, 'users', currentUserId);
      
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
        
          setNotifications(userData.notifications || []); 
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [currentUserId]);

  const handleDismissNotification = async (notification) => {
    const userDocRef = doc(db, 'users', currentUserId);
    try {
      await updateDoc(userDocRef, {
        notifications: arrayRemove(notification)
      });
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n !== notification)
      );
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const loadMoreNotifications = () => {
    setVisibleCount(prevCount => prevCount + 5); 
  };

  return (
    <div className='mt-4'>
      <h1 className='primary text-center'>Notifications</h1>
      <div className='row d-flex justify-content-center' style={{ marginRight: '20px', marginTop: '30px' }}>
        <div className='col-md-7 d-flex justify-content-center'>  
          <ul className='mt-4'>
            {notifications.length > 0 ? (
              [...notifications].reverse().slice(0, visibleCount).map((notification, index) => (
                <li className='center primary' key={index}> 
                  <div className='box primary p-4'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-dot" viewBox="0 0 16 16">
                      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                    </svg>
                    {notification.message}
                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '10px' }}>
                      {new Date(notification.timestamp).toLocaleString()} {/* Format timestamp */}
                    </span>
                    {/* <a className='custom-view' onClick={() => handleDismissNotification(notification)} style={{ marginLeft: '10px' }}>Dismiss</a> */}
                  </div>
                </li>
              ))
            ) : (
              <li className='primary' style={{marginLeft: '15px'}}>No new notifications</li>
            )}
          </ul>

         
        </div>
        <div className='row d-flex justify-content-center' style={{marginTop: '-50px', marginLeft: '20px'}}> 
        <div className='col-md-2 d-flex justify-content-center'>
        {notifications.length > visibleCount && (
            <a onClick={loadMoreNotifications} className='custom-view mt-3'>
              Load More
            </a>
          )}
        </div>
        </div>
       
        
      </div>
    </div>
  );
};

export default Notifications;
