import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserId(user.uid);
        setCurrentUser(user); // Add this line to set the entire user object
      } else {
        setCurrentUserId(null);
        setCurrentUser(null); // Also set currentUser to null when logged out
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

  const handleAcceptRequest = async (request) => {
    const requesterRef = doc(db, 'users', request.requesterId);
    const currentUserRef = doc(db, 'users', currentUserId);
  
    try {
      // Add each other as followers
      await updateDoc(currentUserRef, { followers: arrayUnion(request.requesterId) });
      await updateDoc(requesterRef, { following: arrayUnion(currentUserId) });
  
      // Remove the request from notifications
      await handleDismissNotification(request);
  
      // Send a notification to the requester
      const acceptanceNotification = {
        message: `Your follow request has been accepted by ${currentUser.displayName}!`,
        timestamp: new Date().toISOString(),
        status: 'accepted'
      };
      await updateDoc(requesterRef, {
        notifications: arrayUnion(acceptanceNotification)
      });
      
      console.log(`You have accepted ${request.requesterName}'s follow request.`);
    } catch (error) {
      console.error("Error accepting follow request:", error);
    }
  };
  

  const handleDeclineRequest = async (request) => {
    try {
      const userDocRef = doc(db, 'users', currentUserId);
      const requesterRef = doc(db, 'users', request.requesterId);
      
      // Remove the request from notifications and followRequests
      await updateDoc(userDocRef, {
        notifications: arrayRemove(request),
        followRequests: arrayRemove(request)
      });
  
      // Remove the pending request from the requester's pendingFollowRequests
      await updateDoc(requesterRef, {
        pendingFollowRequests: arrayRemove(currentUserId)
      });
  
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n !== request)
      );
  
      console.log(`You have declined ${request.requesterName}'s follow request.`);
    } catch (error) {
      console.error("Error declining follow request:", error);
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
                    {notification.status === 'pending' ? (
                      <>
                        {notification.requesterName} sent you a follow request
                        <a className='custom-view' style={{marginLeft: '25px', marginRight: '10px'}} onClick={() => handleAcceptRequest(notification)}>Accept</a>
                        <a className='custom-view m-1' onClick={() => handleDeclineRequest(notification)}>Decline</a>
                      </>
                    ) : (
                      notification.message
                    )}
                    <br></br>
                    <span style={{ fontSize: 'small', color: 'gray', marginLeft: '10px' }}>
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
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
