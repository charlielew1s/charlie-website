import React, { useState, useEffect, useContext } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config'; // Added firestore import
import { getDoc, doc } from 'firebase/firestore';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Posts.module.css';
import CommentIcon from '@mui/icons-material/Comment';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '@mui/material/Button';
import { AppContext } from './AppContext'; // Import AppContext

const Posts = ({ data }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const functions = getFunctions();
  const db = firestore;
  
  // Use AppContext
  const { posts, fetchPosts, toggleUpdateFlag, updateFlag } = useContext(AppContext);
  const [following, setFollowing] = useState([]);
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

  const handleVote = async (postId, isUpvote) => {
    const functionName = isUpvote ? 'upvote' : 'downvote';
    const voteFunction = httpsCallable(functions, functionName);
  
    try {
      await voteFunction({ documentId: postId, collection: 'posts' });
      fetchPosts(); // Re-fetch posts using context method
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFollowUnfollow = async (userIdToFollow, isFollowing) => {
    const functionName = isFollowing ? 'unfollowUser' : 'followUser';
    const followFunction = httpsCallable(functions, functionName);

    try {
      await followFunction({ userId: userIdToFollow });
      setFollowing((prevFollowing) => {
        return isFollowing
          ? prevFollowing.filter((id) => id !== userIdToFollow)
          : [...prevFollowing, userIdToFollow];
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      {data.map((post) => (
        <div key={post.id} className={styles.postContainer}>
          <div className={styles.userAndFollow}>
            <Link to={`/user/${post.userID}`}>{post.username}</Link>
            {user && user.uid !== post.userID && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => handleFollowUnfollow(post.userID, following.includes(post.userID))}
              >
                {following.includes(post.userID) ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
          <div><strong>{post.name}</strong></div>
          <div>{post.content}</div>
          <div className={styles.voteContainer}>
            <ArrowUpwardIcon onClick={() => handleVote(post.id, true)} />
            <span>{post.votes}</span>
            <ArrowDownwardIcon onClick={() => handleVote(post.id, false)} />
          </div>
          <div className={styles.buttonContainer}>
            {user && user.uid === post.userID && (
              <>
                <EditPost post={post} />
                <DeletePost postId={post.id} />
              </>
            )}
            {user && <CreateComment postId={post.id} />}
            <CommentIcon onClick={() => navigate(`/post/${post.id}`)} />
          </div>
        </div>
      ))}
    </>
  );
};

export default Posts;

