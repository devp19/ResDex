import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Logo from '../images/index.png';
import { Form, Button } from 'react-bootstrap';

const Recovery = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email)
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password );
      setSuccess('Password reset link sent! If the email is correct, you\'ll recieve instructions on how to reset your password in your inbox!');
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
          <div className='container'>
            <div className='row d-flex justify-content-center'>
              <div className='col-md-5 box'>
                <div className='row d-flex justify-content-center' style={{ marginTop: '50px' }}>
                  <h3 className='center primary monarque'> ResDex – Reset Password</h3>
                  <img src={Logo} alt='ResDex Logo' className='center' id='img-login'></img>
                </div>
                <Form className='login-form' onSubmit={handleReset}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className='primary'>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
    
                  {error && <p className="error-text primary">{error}</p>}
                  {success && <p className="success-text primary">{success}</p>}

                  <Button className='custom' type="submit">
                    Reset Password
                  </Button>
                  <p className='primary'>
                    <br></br>
                    Don't have an account? <Link className='primary' to="/signup">Sign Up</Link>
                  </p>
                </Form>
              </div>
            </div>
          </div>
        </div>
    // <div>
    //   <div className='container'>
    //     <div className='row center top'>
    //       <div className='col-md-6 box'>

          
    //       <h3 className='center primary monarque'>ResDex | Password Reset</h3>
    //       <img src={Logo} alt='ResDex Logo' className='center' id='img-login'></img>
    //     </div>
    //     <div className='row center'>
    //       <Form className='login-form' onSubmit={handleReset}>
    //         <Form.Group className="mb-3" controlId="formBasicEmail">
    //           <Form.Label>Email address</Form.Label>
    //           <Form.Control
    //             type="email"
    //             placeholder="Enter email"
    //             value={email}
    //             onChange={(e) => setEmail(e.target.value)}
    //           />
    //         </Form.Group>

    //         {error && <p className="error-text">{error}</p>}
    //         {success && <p className="success-text">{success}</p>}

    //         <Button className='custom' type="submit">
    //           Reset Password
    //         </Button>
    //         <p>
    //           <br />
    //           Already have an account? <Link className='regular' to="/login">Sign In</Link>
    //         </p>
    //       </Form>
    //     </div>
    //   </div>
    //             </div>





    // </div>
  );
};

export default Recovery;
