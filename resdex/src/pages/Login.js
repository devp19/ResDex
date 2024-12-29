import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import Logo from '../images/index.png';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      if (user.emailVerified) {
        localStorage.setItem('authToken', token);
        console.log('Login successful');
        
       

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const username = userData.username;
          
          if (username) {
            navigate(`/profile/${username}`);
            setTimeout(() => {
              window.location.reload();
            }, 100);
          } else {
            setError('Username not found. Please contact support.');
          }
        } else {
          setError('User data not found. Please contact support.');
        }
      } else {
        setError('Email has not been verified. Please verify before continuing!');
        await signOut(auth);
      }
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
      console.error(err);
    }
  };

  return (
    <div>
      <div className='container'>
        <div className='row d-flex justify-content-center'>
          <div className='col-md-5 box'>
            <div className='row d-flex justify-content-center' style={{ marginTop: '50px' }}>
              <h3 className='center primary monarque'> ResDex – Sign In</h3>
              <img src={Logo} alt='ResDex Logo' className='center' id='img-login'></img>
            </div>
            <Form className='login-form' onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className='primary'>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label className='primary'>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Link className='primary' to="/recovery">Forgot your password?</Link>
              <br></br>

              {error && <strong className="error-text primary">{error}<br></br></strong>}
              
              <Button className='custom' type="submit">
                Sign In
              </Button>
              <p className='primary'>
                <br></br>
                <br></br>
                Don't have an account? <Link className='primary' to="/signup">Sign Up</Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;