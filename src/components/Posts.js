import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate for redirection
import styles from './Posts.module.css';
import CommentIcon from '@mui/icons-material/Comment';

const Posts = ({ data }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div>
      {data.map((post, index) => (
        <div key={post.id} className={styles.postContainer}>
          {user && user.uid === post.userID && (
            <div className={styles.buttonContainer}>
              <EditPost post={post} />
              <DeletePost postId={post.id} />
            </div>
          )}
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
