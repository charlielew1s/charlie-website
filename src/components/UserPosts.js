import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Posts from './Posts';
import styles from './Home.module.css';

const UserPosts = () => {
  const [userPosts, setUserPosts] = useState([]);
  const { userId } = useParams();

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
      <div className={styles.homeBanner}>User's Posts</div>
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
