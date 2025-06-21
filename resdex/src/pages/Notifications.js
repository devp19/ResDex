import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import useAnimationEffect from "../hooks/useAnimationEffect";
import { Logo, LoadingSpinner } from "../components/common";

const Notifications = () => {
  // Use the custom animation hook
  useAnimationEffect();

  const [notifications, setNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        setCurrentUserId(user.uid);
        await fetchNotifications(user.uid);
      } else {
        setNotifications([]);
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userNotifications = userData.notifications || [];
        setNotifications(userNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleAcceptRequest = async (notification, requesterUID) => {
    try {
      // Update current user's following list
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        following: arrayUnion(requesterUID),
        notifications: arrayRemove(notification),
      });

      // Update requester's followers list
      const requesterRef = doc(db, "users", requesterUID);
      await updateDoc(requesterRef, {
        followers: arrayUnion(currentUserId),
      });

      // Refresh notifications
      await fetchNotifications(currentUserId);
    } catch (error) {
      console.error("Error accepting follow request:", error);
    }
  };

  const handleDeclineRequest = async (notification) => {
    try {
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        notifications: arrayRemove(notification),
      });

      await fetchNotifications(currentUserId);
    } catch (error) {
      console.error("Error declining follow request:", error);
    }
  };

  const loadMoreNotifications = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <div className="mt-4 fade-in">
      <div className="row justify-content-center d-flex display fade-in">
        <Logo />
      </div>
      <div className="row text-center fade-in">
        <p className="primary">⏐</p>
      </div>
      <h1 className="primary monarque text-center">Notifications</h1>
      <div
        className="row d-flex justify-content-center"
        style={{ marginRight: "20px", marginTop: "30px" }}
      >
        <div className="col-md-7 d-flex justify-content-center">
          <ul className="mt-4">
            {notifications.length > 0 ? (
              [...notifications]
                .reverse()
                .slice(0, visibleCount)
                .map((notification, index) => (
                  <li className="center primary" key={index}>
                    <div className="notification-item mb-3 p-3 border rounded">
                      <p className="mb-2">{notification.message}</p>
                      {notification.type === "follow_request" && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleAcceptRequest(
                                notification,
                                notification.requesterUID
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeclineRequest(notification)}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))
            ) : (
              <li className="center primary">
                <p className="primary">You're all caught up!</p>
              </li>
            )}
          </ul>
        </div>
      </div>

      {notifications.length > visibleCount && (
        <div className="row d-flex justify-content-center mt-3">
          <div className="col-md-7 text-center">
            <button
              className="btn btn-outline-primary"
              onClick={loadMoreNotifications}
            >
              Load More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
