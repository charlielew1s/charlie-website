import React from 'react';
import './LoginPage.css';

function LoginPage() {
  return (
    <div>
      <div className="top-bar">
        <a href="/" className="logo">Logo</a>
        <div className="title">Website Title</div>
      </div>
      <div className="first-content">
          <button type="submit">Log In</button>
      </div>
    </div>
  );
}

export default LoginPage;

