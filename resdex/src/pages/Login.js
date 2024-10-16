import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Logo from '../images/index.png';
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      if(userCredential.user.emailVerified){
        localStorage.setItem('authToken', token);
        console.log('Login successful');
        console.log(userCredential.user.displayName)
        navigate('/profile');
      }
      else {
        setError('Email has not been verified. Please verify before continuing!')
      }
  
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
      console.error(err);
    }
  };

  return (
    <div>
      <div className='container'>
        <div className='row center top'>
          <h3 className='center'> ResDex | Sign In</h3>
          <img src={Logo} alt='ResDex Logo' className='center' id='img-login'></img>
        </div>
        <div className='row center'>
          <Form className='login-form' onSubmit={handleSubmit}>
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
            <Button className='custom' type="submit">
              Sign In
            </Button>
            <p>
              <br>
              </br>
              <br></br>
      Don't have an account? <Link className='regular' to="/signup">Sign Up</Link>
    </p>
          </Form>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
