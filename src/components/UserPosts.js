import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Posts from './Posts';
import styles from './Home.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './config';

const UserPosts = () => {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(''); // State for username
  const [userPosts, setUserPosts] = useState([]);
  const { userId } = useParams();
  const navigate = useNavigate();

  const fetchUsername = async () => {
    if (user) {
      const userRef = doc(getFirestore(), 'users', user.uid);
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
    const functions = getFunctions();
    const getPostsByUser = httpsCallable(functions, 'getPostsByUser');

    getPostsByUser({ userId })
      .then((result) => {
        setUserPosts(result.data.posts);
      })
      .catch((error) => {
        console.error('Error fetching user posts:', error);
      });
  }, [userId]);

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
        {userPosts.length > 0 ? (
          <Posts data={userPosts} />
        ) : (
          <p>No posts available for this user.</p>
        )}
      </div>
    </>
  );
};

export default UserPosts;

