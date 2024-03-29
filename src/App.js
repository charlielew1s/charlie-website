import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import Home from './components/Home';
import PostDetails from './components/PostDetails';
import UserPosts from './components/UserPosts';
import PersonalizedFeed from './components/PersonalizedFeed';
import { AppProvider } from './components/AppContext'; // Import AppProvider from AppContext

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
    <Router>
      <AppProvider> {/* Replace individual providers with AppProvider */}
        <div>
          <Routes>
            <Route path="/" element={userEmail ? <Home userEmail={userEmail} onSignOut={handleSignOut} /> : <SignIn onSignIn={setUserEmail} />} />
            <Route path="/post/:postId" element={<PostDetails />} />
            <Route path="/user/:userId" element={<UserPosts />} />
            <Route path="/personalized-feed" element={<PersonalizedFeed />} />
          </Routes>
        </div>
      </AppProvider>
    </Router>
  );
}

export default App;

