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
const Comment = ({ comment, currentUser, isLastComment }) => (
  <div className={isLastComment ? styles.lastCommentContainer : styles.commentContainer}>
    <p>{comment.content}</p>
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
  const [showComments, setShowComments] = useState({});

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

  const toggleComments = (postId) => {
    setShowComments(prevShowComments => ({ ...prevShowComments, [postId]: !prevShowComments[postId] }));
  };

  return (
    <div>
      {data.map((post, index) => (
        <React.Fragment key={post.id}>
          <div className={styles.postContainer}>
            {user && user.uid === post.userID && (
              <div className={styles.buttonContainer}>
                <EditPost post={post} />
                <DeletePost postId={post.id} />
              </div>
            )}
            <div><strong>{post.name}</strong></div>
            <br></br>
            <div>{post.content}</div>
            <br></br>
            {user && <CreateComment postId={post.id} />}
            <button onClick={() => toggleComments(post.id)}>
              {showComments[post.id] ? 'Hide Comments' : 'Show Comments'}
            </button>
            {showComments[post.id] && <p className={styles.commentsLabel}>Comments:</p>}
          </div>
          {showComments[post.id] && comments[post.id] && comments[post.id].map((comment, commentIndex, commentArray) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUser={user}
              isLastComment={commentIndex === commentArray.length - 1}
            />
          ))}
          {/* This div is used to add space after the last comment of each post */}
          {data.length - 1 !== index && <div className={styles.spaceAfterComments}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Posts;

