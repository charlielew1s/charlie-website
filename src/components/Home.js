import React, { useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth'; // Use for auth state
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions
import { auth, firestore } from './config'; // Firebase configuration
import styles from './Home.module.css';
import Posts from './Posts';
import CreatePost from './CreatePost'; 
import { signOut } from "firebase/auth";
import LogoutIcon from '@mui/icons-material/Logout';
import { Button } from '@mui/material'; 
import EditUsername from './EditUsername';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './AppContext'; // Import AppContext

function Home({ userEmail, onSignOut }) {
  const [isEditUsernameOpen, setIsEditUsernameOpen] = useState(false);
  const navigate = useNavigate();
  const [user] = useAuthState(auth); // Get the current user
  const [username, setUsername] = useState(''); // State for username

  // Use AppContext
  const { posts, fetchPosts, updateFlag } = useContext(AppContext);

  useEffect(() => {
    console.log('Component re-rendered with posts:', posts);
  }, [posts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, updateFlag]);
    
  const logout = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      if (onSignOut) {
        onSignOut();
      }
    }).catch((error) => {
      console.error("Error during sign-out:", error);
    });
  };

  const fetchUsername = async () => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUsername(userSnap.data().username);
      } else {
        console.log("No such document!");
      }
    } else {
      setUsername(''); // Clear username if no user is logged in
    }
  };

  useEffect(() => {
    fetchUsername();
  }, [user]);
    
  return (
    <>
      <div className={styles.homeBanner}>
        RedditSimilar
        <span className={styles.authenticatedUser}>
          {username ? <span>Hello, {username}</span> : null} {/* Display the app-specific username */}
        </span>
        <Button onClick={() => navigate('/personalized-feed')}>Personalized Feed</Button>
        <Button onClick={() => setIsEditUsernameOpen(true)}>Edit Username</Button>
        <EditUsername 
            open={isEditUsernameOpen} 
            handleClose={() => setIsEditUsernameOpen(false)}
        />
      </div>
      <LogoutIcon className={styles.logoutButton} onClick={logout}>Logout</LogoutIcon>

      <div className={styles.homeContainer}>
        <CreatePost />
        {posts.length > 0 ? (
          <Posts data={posts} />
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </>
  );
}

export default Home;
