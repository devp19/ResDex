import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Logo from '../images/index.png'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div>
    
      <div className='container'>
        <div className='row center top'>
          <h3 className='center'> ResDex | Sign In</h3>
          <br></br>
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
        
          <Button className='custom' type="submit">
            Sign In
          </Button>
        </Form>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
