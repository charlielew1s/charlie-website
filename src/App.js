import React, { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import Home from './components/Home';

function App() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const handleSignOut = () => {
    setUserEmail(null);
  };

  return (
    <div>
       {userEmail ? <Home userEmail={userEmail} onSignOut={handleSignOut} /> : <SignIn onSignIn={setUserEmail} />}
    </div>
  );
}

export default App;