import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import NavbarLogo from '../images/logo.png';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');

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
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUsername('');
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
            <NavLink exact to="/" className="nav-link" activeClassName="active">Home</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/about" className="nav-link" activeClassName="active">About</NavLink>
          </li>
          {user && username && (
            <li className="nav-item">
              <NavLink to={`/profile/${username}`} className="nav-link" activeClassName="active">Profile</NavLink>
            </li>
          )}
          <li className="nav-item">
            {user ? (
              <NavLink to="/" className="nav-link" onClick={handleLogout}>Logout</NavLink>
            ) : (
              <NavLink to="/login" className="nav-link" activeClassName="active">Sign In</NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;