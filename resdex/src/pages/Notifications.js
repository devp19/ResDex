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

  const isAcceptedFollowNotification = (notification) => {
    return (
      typeof notification.message === "string" &&
      notification.message.startsWith(
        "Your follow request has been accepted by"
      )
    );
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setCurrentUser(user);
      } else {
        setCurrentUserId(null);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUserId) return;

      const userDocRef = doc(db, "users", currentUserId);
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
    const userDocRef = doc(db, "users", currentUserId);
    try {
      await updateDoc(userDocRef, {
        notifications: arrayRemove(notification),
      });
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n !== notification)
      );
      window.location.reload();
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const handleAcceptRequest = async (request) => {
    const requesterRef = doc(db, "users", request.requesterId);
    const currentUserRef = doc(db, "users", currentUserId);

    try {
      await updateDoc(currentUserRef, {
        followers: arrayUnion(request.requesterId),
        following: arrayUnion(request.requesterId),
        followRequests: arrayRemove(request),
        notifications: arrayRemove(request),
      });

      await updateDoc(requesterRef, {
        following: arrayUnion(currentUserId),
        followers: arrayUnion(currentUserId),
        pendingFollowRequests: arrayRemove(currentUserId),
      });

      const acceptanceNotification = {
        message: `Your follow request has been accepted by ${currentUser.displayName}!`,
        timestamp: new Date().toISOString(),
        status: "accepted",
      };
      await updateDoc(requesterRef, {
        notifications: arrayUnion(acceptanceNotification),
      });

      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n !== request)
      );

      console.log(
        `You have accepted ${request.requesterName}'s follow request and are now following them.`
      );
      window.location.reload();
    } catch (error) {
      console.error("Error accepting follow request:", error);
    }
  };

  const handleDeclineRequest = async (request) => {
    const requesterRef = doc(db, "users", request.requesterId);
    const currentUserRef = doc(db, "users", currentUserId);

    try {
      await updateDoc(currentUserRef, {
        followRequests: arrayRemove(request),
        notifications: arrayRemove(request),
      });

      await updateDoc(requesterRef, {
        pendingFollowRequests: arrayRemove(currentUserId),
      });

      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n !== request)
      );

      console.log(
        `You have declined ${request.requesterName}'s follow request.`
      );
      window.location.reload();
    } catch (error) {
      console.error("Error declining follow request:", error);
    }
  };

  const loadMoreNotifications = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  // Function to format timestamp without seconds
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
                    <div className="box primary p-4">
                      {notification.status === "pending" ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="primary"
                            className="bi bi-dot"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                          </svg>
                          <a
                            className="primary"
                            target="_blank"
                            href={`https://resdex.ca/profile/${notification.requesterName}`}
                          >
                            {notification.fullName}
                          </a>{" "}
                          sent you a follow request!
                          <br></br>
                          <br></br>
                          <a
                            className="custom-view"
                            style={{ marginLeft: "15px", marginRight: "10px" }}
                            onClick={() => handleAcceptRequest(notification)}
                          >
                            Accept
                          </a>
                          <a
                            className="custom-view m-1"
                            onClick={() => handleDeclineRequest(notification)}
                          >
                            Decline
                          </a>
                          <br></br>
                        </>
                      ) : isAcceptedFollowNotification(notification) ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span className="primary">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="primary"
                              className="bi bi-dot"
                              viewBox="0 0 16 16"
                            >
                              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                            </svg>{" "}
                            {notification.message}
                          </span>
                          <button
                            onClick={() =>
                              handleDismissNotification(notification)
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "gray",
                              fontSize: "1.2em",
                              marginLeft: "10px",
                              cursor: "pointer",
                              lineHeight: 1,
                            }}
                            aria-label="Dismiss notification"
                            title="Dismiss"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        notification.message
                      )}
                      <br></br>
                      <span
                        style={{
                          fontSize: "small",
                          color: "gray",
                          marginLeft: "10px",
                        }}
                      >
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </li>
                ))
            ) : (
              <p className="primary" style={{ marginLeft: "15px" }}>
                You're all caught up!
              </p>
            )}
          </ul>
        </div>
        <div
          className="row d-flex justify-content-center"
          style={{ marginTop: "-50px", marginLeft: "20px" }}
        >
          <div className="col-md-2 d-flex justify-content-center">
            {notifications.length > visibleCount && (
              <a onClick={loadMoreNotifications} className="custom-view mt-3">
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
