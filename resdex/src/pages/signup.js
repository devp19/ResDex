import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Logo from '../images/index.png';
import { Form, Button } from 'react-bootstrap';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      
      setSuccess('Verification email sent! Please check your inbox to verify your email address.');

      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (err) {
      setError(err.message);
    }
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
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
