import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Posts from './Posts';
import styles from './Home.module.css';

const PersonalizedFeed = () => {
  const [personalizedPosts, setPersonalizedPosts] = useState([]);

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
  }, []);

  return (
    <div className={styles.homeContainer}>
      {personalizedPosts.length > 0 ? (
        <Posts data={personalizedPosts} />
      ) : (
        <p>No personalized posts available.</p>
      )}
    </div>
  );
};

export default PersonalizedFeed;
