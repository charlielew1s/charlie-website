import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Posts from './Posts';
import styles from './Home.module.css';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate for redirection
import ArrowBackIcon from '@mui/icons-material/ArrowBack';



const UserPosts = () => {
  const [userPosts, setUserPosts] = useState([]);
  const { userId } = useParams(); // Get userId from route parameter
  const navigate = useNavigate(); // Hook for navigation

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
      <ArrowBackIcon className={styles.createPostButton} onClick={() => navigate(`/`)}></ArrowBackIcon>
    </div>
      <div className={styles.homeContainer}>
        {userPosts.length > 0 ? (
          <Posts data={userPosts} />
        ) : (
          <p>No posts available for this user.</p>
        )}
      </div>
      {/* Any other content you want to include outside the homeContainer */}
    </>
  );
};

export default UserPosts;
