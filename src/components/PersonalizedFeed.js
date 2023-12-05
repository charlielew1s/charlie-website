import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config';
import { doc, getDoc } from 'firebase/firestore';
import Posts from './Posts';
import styles from './Home.module.css';

const PersonalizedFeed = () => {
  const [personalizedPosts, setPersonalizedPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [user] = useAuthState(auth);

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
    </div>
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
