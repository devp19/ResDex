// src/pages/Signup.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../images/index.png';
import { Form, Button } from 'react-bootstrap';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    const username = displayName.toLowerCase().replace(/\s+/g, '');
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    // Validate username length
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    // Validate username characters
    if (!usernameRegex.test(username)) {
      setError(
        'Username can only contain letters and numbers, with no spaces or special characters.'
      );
      return;
    }

    // Check if passwords match
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Check if username exists in Firestore
      const usernameQuery = query(
        collection(db, 'usernames'),
        where('username', '==', username)
      );
      const usernameQuerySnapshot = await getDocs(usernameQuery);

      if (!usernameQuerySnapshot.empty) {
        setError('Username already exists. Please choose a different one.');
        return;
      }

      // Proceed to call the backend API to create the user in Auth0
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, displayName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          'Signup successful! Please check your email to verify your account.'
        );
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('Signup failed.');
    }
  };

  const handlePassword2Change = (e) => {
    const value = e.target.value;
    setPassword2(value);
    setPasswordMatch(value === password);
  };

  return (
    <div>
      <div className='container'>
        <div className='row d-flex justify-content-center'>
          <div className='col-md-5 box'>
            <div
              className='row d-flex justify-content-center'
              style={{ marginTop: '50px' }}
            >
              <h3 className='center primary monarque'>ResDex – Sign Up</h3>
              <img
                src={Logo}
                alt='ResDex Logo'
                className='center'
                id='img-login'
              ></img>
            </div>
            <div className='row d-flex justify-content-center'>
              <Form className='login-form' onSubmit={handleSignup}>
                <Form.Group className='mb-3' controlId='formBasicFullName'>
                  <Form.Label className='primary'>Full Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter full name'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formBasicDisplayName'>
                  <Form.Label className='primary'>
                    Display Name (Username)
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter display name'
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formBasicEmail'>
                  <Form.Label className='primary'>Email address</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formBasicPassword'>
                  <Form.Label className='primary'>Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formBasicPassword2'>
                  <Form.Label className='primary'>Confirm Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Retype Password'
                    value={password2}
                    onChange={handlePassword2Change}
                    isInvalid={!passwordMatch && password2.length > 0}
                    required
                  />
                  <Form.Control.Feedback type='invalid'>
                    Passwords do not match
                  </Form.Control.Feedback>
                </Form.Group>

                {error && <p className='error-text primary'>{error}</p>}
                {success && <p className='success-text primary'>{success}</p>}

                <Button className='custom' type='submit'>
                  Sign Up
                </Button>
                <p className='primary'>
                  <br />
                  Already have an account?{' '}
                  <Link className='primary' to='/login'>
                    Sign In
                  </Link>
                </p>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;