import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config';
import { doc, getDoc } from 'firebase/firestore';
import Posts from './Posts';
import styles from './Home.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate here


const PersonalizedFeed = () => {
  const [personalizedPosts, setPersonalizedPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(''); // State for username
  const navigate = useNavigate();

  // Function to fetch username from Firestore
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

  useEffect(() => {
    const fetchFollowing = async () => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setFollowing(userDoc.data().following || []);
        }
      }
    };

    fetchFollowing();
  }, [user]);

  useEffect(() => {
    const functions = getFunctions();
    const getPersonalizedFeed = httpsCallable(functions, 'getPersonalizedFeed');

    getPersonalizedFeed()
      .then((result) => {
        setPersonalizedPosts(result.data.posts);
      })
      .catch((error) => {
        console.error('Error fetching personalized feed:', error);
      });
  }, [user]); // Ensure this useEffect runs whenever the user changes

  return (
    <>
      <div className={styles.homeBanner}>
        RedditSimilar
        <span className={styles.authenticatedUser}>
          {username ? <span>Hello, {username}</span> : null} {/* Display the app-specific username */}
        </span>
      </div>
      <ArrowBackIcon className={styles.createPostButton} onClick={() => navigate(`/`)} />
      <div className={styles.homeContainer}>
        {personalizedPosts.length > 0 ? (
          <Posts data={personalizedPosts} following={following} />
        ) : (
          <p>No personalized posts available.</p>
        )}
      </div>
    </>
  );
};

export default PersonalizedFeed;

