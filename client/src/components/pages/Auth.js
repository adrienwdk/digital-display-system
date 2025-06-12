import React, { useState } from 'react';
import Login from '../auth/Login';
import Signup from '../auth/Signup';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f4f7f9',
      padding: '20px'
    }}>
      {isLogin ? 
        <Login onToggleForm={toggleForm} /> : 
        <Signup onToggleForm={toggleForm} />
      }
    </div>
  );
};

export default Auth;
