import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';         // Assuming Home.js is in the components folder
import SignIn from './components/SignIn';     // Assuming SignIn.js is in the components folder
import PostComments from './components/PostComments'; // Assuming PostComments.js is in the components folder

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/comments/:postId" element={<PostComments />} />
        {/* Other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
