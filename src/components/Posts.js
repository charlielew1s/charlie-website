import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Posts.module.css';
import CommentIcon from '@mui/icons-material/Comment';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; 
import { Button } from '@mui/material';

const Posts = ({ data }) => {
  const [user] = useAuthState(auth);
  const [following, setFollowing] = useState([]); // Correct state for tracking following status
  const navigate = useNavigate();
  const functions = getFunctions();
  const db = getFirestore();

  useEffect(() => {
    const fetchFollowing = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setFollowing(userDoc.data().following || []);
        }
      }
    };

    fetchFollowing();
  }, [user]);

  const handleFollowUnfollow = async (userIdToFollow, isFollowing) => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const functionName = isFollowing ? 'unfollowUser' : 'followUser';
    const firebaseFunction = httpsCallable(functions, functionName);

    try {
      await firebaseFunction({ userId: userIdToFollow });
      console.log(`${isFollowing ? 'Unfollowed' : 'Followed'} user:`, userIdToFollow);
      setFollowing(prev => isFollowing ? prev.filter(id => id !== userIdToFollow) : [...prev, userIdToFollow]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {data.map(post => (
        <div key={post.id} className={styles.postContainer}>
          <div className={styles.userAndFollow}>
            <Link to={`/user/${post.userID}`}>{post.username}</Link>
            {''}
            {user && user.uid !== post.userID && (
              <Button variant="outlined" size="small" onClick={() => handleFollowUnfollow(post.userID, following.includes(post.userID))}>
                {following.includes(post.userID) ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
          <div><strong>{post.name}</strong></div>
          <div>{post.content}</div>
          {user && user.uid === post.userID && (
            <div className={styles.buttonContainer}>
              <EditPost post={post} />
              <DeletePost postId={post.id} />
            </div>
          )}
          {user && <CreateComment postId={post.id} />}
          <CommentIcon onClick={() => navigate(`/post/${post.id}`)} />
        </div>
      ))}
    </div>
  );
};


export default Posts;
