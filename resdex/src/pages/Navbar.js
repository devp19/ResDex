import React from 'react';
import { NavLink } from 'react-router-dom';
import NavbarLogo from '../images/logo.png';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light pt-4">
      <NavLink className="navbar-brand" to="/">
        <img id="navbar-logo" className="img-fluid" src={NavbarLogo} alt="ResDex Logo" />
      </NavLink>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
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
          <li className="nav-item">
            <NavLink to="/news" className="nav-link" activeClassName="active">News</NavLink>
          </li>
          <li className="nav-item">

            
            <NavLink to="/login" className="nav-link" activeClassName="active">Sign In</NavLink>
          </li>
        </ul>
      </div>

    </nav>
  );
};

export default Navbar;
