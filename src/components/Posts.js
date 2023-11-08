import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from './Posts.module.css'; // Import the CSS module here


// Comment component placeholder
const Comment = ({ comment, postId, currentUser }) => (
  <div className={styles.commentContainer}>
    <p>{comment.content}</p>
    {/* Only show edit and delete buttons if the current user created this comment */}
    {currentUser && currentUser.uid === comment.userID && (
      <div className={styles.buttonContainer}>
        <EditComment comment={comment} />
        <DeleteComment commentId={comment.id} />
      </div>
    )}
  </div>
);

const Posts = ({ data }) => {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState({});

  const fetchComments = async (postId) => {
    const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(q);
    const commentsForPost = [];
    commentsSnapshot.forEach(doc => {
      commentsForPost.push({ id: doc.id, ...doc.data() });
    });
    setComments(prevComments => ({ ...prevComments, [postId]: commentsForPost }));
  };

  useEffect(() => {
    data.forEach(post => {
      fetchComments(post.id);
    });
  }, [data]);

  const renderComments = (postId) => {
    const commentsForPost = comments[postId] || [];
    return (
      <div>
        {commentsForPost.map(comment => (
          <Comment
            key={comment.id}
            comment={comment}
            postId={postId}
            currentUser={user}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      {data.map((post) => (
        <div key={post.id} className={styles.postContainer}>
          {user && post.userID === user.uid && (
            <div className={styles.buttonContainer}>
              <EditPost post={post} />
              <DeletePost postId={post.id} />
            </div>
          )}
          <div><strong>{post.name}</strong></div>
          <br />
          <div>{post.content}</div>
          <p>Comments:</p>
          {renderComments(post.id)}
          {user && <CreateComment postId={post.id} />}
        </div>
      ))}
    </div>
  );
}

export default Posts;