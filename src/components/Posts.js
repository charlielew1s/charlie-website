import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Posts.module.css';
import CommentIcon from '@mui/icons-material/Comment';
import { getFunctions, httpsCallable } from 'firebase/functions';

const Posts = ({ data }) => {
  const [user] = useAuthState(auth);
  const functions = getFunctions();
  const navigate = useNavigate();

  // Handle follow or unfollow action
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
      // Optionally, trigger a UI update or state change here
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {data.map((post) => (
        <div key={post.id} className={styles.postContainer}>
          {user && user.uid === post.userID && (
            <div className={styles.buttonContainer}>
              <EditPost post={post} />
              <DeletePost postId={post.id} />
            </div>
          )}
          {user && user.uid !== post.userID && (
            <button onClick={() => handleFollowUnfollow(post.userID, post.isFollowing)}>
              {post.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
          <Link to={`/user/${post.userID}`}>{post.username}</Link>
          <div><strong>{post.name}</strong></div>
          <div>{post.content}</div>
          {user && <CreateComment postId={post.id} />}
          <CommentIcon onClick={() => navigate(`/post/${post.id}`)}> 
          </CommentIcon>
        </div>
      ))}
    </div>
  );
};

export default Posts;
