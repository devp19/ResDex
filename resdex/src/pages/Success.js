import React from 'react';
import { auth } from '../firebaseConfig';

const Success = () => {
  return (
    <div>
      <h1>Welcome, {auth.currentUser.displayName}!</h1>
      <p>Login worked!</p>
    </div>
  );
};

export default Success;
