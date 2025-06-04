import React, { useState } from 'react';
import Login from '../Components/Forms/Login';

const LoginForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <div>
      <Login setIsLoggedIn={setIsLoggedIn} />
    </div>
  );
};

export default LoginForm;
