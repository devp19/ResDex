import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import Logo from '../images/index.png';
import { collection, addDoc, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';



const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    const username = displayName.toLowerCase().replace(/\s+/g, '');
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log("Checking if username exists...");
      const usernameQuery = query(collection(db, 'usernames'), where('username', '==', username));
      const usernameQuerySnapshot = await getDocs(usernameQuery);
      
      if (!usernameQuerySnapshot.empty) {
        setError('Username already exists. Please choose a different one.');
        return;
      }

      console.log("Creating user with email and password...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user.uid);

      console.log("Sending email verification...");
      await sendEmailVerification(user);

      console.log("Updating user profile...");
      await updateProfile(auth.currentUser, { displayName: fullName });

      // Write to Firestore
      console.log("Adding username to 'usernames' collection...");
      await setDoc(doc(db, 'usernames', username), {
        username: username,
        userId: user.uid
      });

      console.log("Adding user details to 'users' collection...");
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: fullName,
        displayName: username,
        email: email,
        profilePicture: null,
        username: username,
      });

      console.log("Firestore write operations completed successfully");
      
      setSuccess('Verification email sent! Please check your inbox to verify your email address.');
      await signOut(auth);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (authError) {
      console.error("Error during authentication:", authError);
      setError(authError.message);
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
        <div className='row center top'>
          <h3 className='center'>ResDex | Sign Up</h3>
          <img src={Logo} alt='ResDex Logo' className='center' id='img-login'></img>
        </div>
        <div className='row center'>
          <Form className='login-form' onSubmit={handleSignup}>
            <Form.Group className="mb-3" controlId="formBasicFullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDisplayName">
              <Form.Label>Display Name (Username)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword2">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Retype Password"
                value={password2}
                onChange={handlePassword2Change}
                isInvalid={!passwordMatch && password2.length > 0}
                required='true'
              />
              <Form.Control.Feedback type="invalid">
                Passwords do not match
              </Form.Control.Feedback>
            </Form.Group>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <Button className='custom' type="submit">
              Sign Up
            </Button>
            <p>
              <br />
              Already have an account? <Link className='regular' to="/login">Sign In</Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
