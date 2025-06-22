import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import NavbarLogo from '../images/logo-icon.png';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Tooltip } from 'react-tooltip';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUsername(userData.username);
            setNotificationCount(userData.notifications ? userData.notifications.length : 0);

          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUsername('');
        setNotificationCount();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      auth.signOut();
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light pt-4">
      <NavLink className="navbar-brand" to="/">
        <img id="navbar-logo" className="img-fluid" src={NavbarLogo} alt="ResDex Logo" />
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink exact to="/" className="nav-link" activeClassName="active" data-tooltip-id="nav-tooltip"
              data-tooltip-content="Home">

            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-house-door-fill" viewBox="0 0 16 16">
  <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/>
</svg>
</NavLink>
          </li>


          <li className="nav-item">
            <NavLink exact to="/search" className="nav-link" activeClassName="active" data-tooltip-id="nav-tooltip"
              data-tooltip-content="Search">


            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-search" viewBox="0 0 16 16">
  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
</svg>
</NavLink>
          </li>
          <li className="nav-item">
            <NavLink exact to="/notifications" className="nav-link" activeClassName="active" data-tooltip-id="nav-tooltip"
              data-tooltip-content="Notifications">
            


            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" class="bi bi-bell-fill" viewBox="0 0 16 16">
  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
</svg>

{notificationCount > 0 && (
    <span className="badge bg-danger" style={{marginLeft: '4px', fontSize: '0.75em'}}>
      {notificationCount}
    </span>
  )}
</NavLink>
          </li>
          {user && (
          <li className="nav-item">
            <NavLink exact to="/messages" className="nav-link" activeClassName="active" data-tooltip-id="nav-tooltip"
              data-tooltip-content="Messages">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" class="bi bi-chat-dots-fill" viewBox="0 0 16 16">
                <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              </svg>
            </NavLink>
          </li>
          )}
          
          {/* <li className="nav-item">
            <NavLink to="/about" className="nav-link" activeClassName="active">About</NavLink>
          </li> */}
          {user && username && (
            <li className="nav-item">
              <NavLink to={`/profile/${username}`} className="nav-link" activeClassName="active"data-tooltip-id="nav-tooltip"
              data-tooltip-content="My Profile">

              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" class="bi bi-person-circle" viewBox="0 0 16 16">
  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
</svg>

</NavLink>

            </li>
            
          )}
          <li className="nav-item" data-toggle="tooltip" data-placement="bottom" title={user ? "Logout" : "Login"}>
            {user ? (
              <NavLink to="/login" 
                className="nav-link" 
                onClick={handleLogout}
                data-tooltip-id="nav-tooltip"
                data-tooltip-content="Logout"
              >

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
            </svg>
            
            </NavLink>
            ) : (
              <NavLink to="/login" className="nav-link" activeClassName="active" 
                data-tooltip-id="nav-tooltip"
                data-tooltip-content="Login"> 
              

              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
              <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
            </svg>
            
            </NavLink>
            )}
          </li>
         
        </ul>
      </div>

<Tooltip 
      id="nav-tooltip" 
      place="bottom" 
      effect="solid" 
      className="z-index-tooltip"
    />

    </nav>
  );
};

export default Navbar;