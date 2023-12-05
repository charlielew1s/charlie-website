import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Posts from './Posts';
import styles from './Home.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { Link, useNavigate } from 'react-router-dom';

const UserPosts = () => {
  const [userPosts, setUserPosts] = useState([]);
  const { userId } = useParams();
  const navigate = useNavigate();

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
          <ArrowBackIcon className={styles.createPostButton} onClick={() => navigate(`/`)} />
            RedditSimilar
      </div>
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
