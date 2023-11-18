import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import CreateReply from './CreateReply'; // Import CreateReply
import EditReply from './EditReply'; // Import EditReply
import DeleteReply from './DeleteReply'; // Import DeleteReply
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import styles from './Posts.module.css'; // Import the CSS module here
import CommentIcon from '@mui/icons-material/Comment';

// Reply component
const Reply = ({ reply, currentUser }) => (
  <div className={styles.replyContainer}>
    <p>{reply.content}</p>
    {currentUser && currentUser.uid === reply.userID && (
      <div className={styles.buttonContainer}>
        <EditReply reply={reply} />
        <DeleteReply replyId={reply.id} />
      </div>
    )}
  </div>
);

// Comment component with integrated replies
const Comment = ({ comment, currentUser, replies, fetchReplies }) => {
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    if (showReplies) {
      fetchReplies(comment.id);
    }
  }, [showReplies, comment.id, fetchReplies]);

  return (
    <div className={styles.commentContainer}>
      <p>{comment.content}</p>
      {currentUser && currentUser.uid === comment.userID && (
        <div className={styles.buttonContainer}>
          <EditComment comment={comment} />
          <DeleteComment commentId={comment.id} />
        </div>
      )}
      <button onClick={() => setShowReplies(!showReplies)}>
        {showReplies ? 'Hide Replies' : 'Show Replies'}
      </button>
      {showReplies && (
        <>
          {replies[comment.id] && replies[comment.id].map(reply => (
            <Reply key={reply.id} reply={reply} currentUser={currentUser} />
          ))}
          <CreateReply commentId={comment.id} />
        </>
      )}
    </div>
  );
};

const Posts = ({ data }) => {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [replies, setReplies] = useState({}); // State to store replies

  const fetchComments = async (postId) => {
    const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(q);
    const commentsForPost = [];
    commentsSnapshot.forEach(doc => {
      commentsForPost.push({ id: doc.id, ...doc.data() });
    });
    setComments(prevComments => ({ ...prevComments, [postId]: commentsForPost }));
  };

  const toggleComments = (postId) => {
    setShowComments(prevShowComments => ({ ...prevShowComments, [postId]: !prevShowComments[postId] }));
  };

const fetchReplies = async (commentId) => {
  const q = query(collection(firestore, 'replies'), where('commentId', '==', commentId));
  const repliesSnapshot = await getDocs(q);
  const repliesForComment = [];
  repliesSnapshot.forEach(doc => {
    repliesForComment.push({ id: doc.id, ...doc.data() });
  });
  setReplies(prevReplies => ({ ...prevReplies, [commentId]: repliesForComment }));
};


  useEffect(() => {
    data.forEach(post => {
      fetchComments(post.id);
    });
  }, [data]);

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
            <div>{post.content}</div>
            {user && <CreateComment postId={post.id} />}
            <button onClick={() => toggleComments(post.id)}>
              <CommentIcon />
            </button>
            {comments[post.id] && comments[post.id].map(comment => (
              <Comment
                key={comment.id}
                comment={comment}
                currentUser={user}
                replies={replies}
                fetchReplies={fetchReplies}
              />
            ))}
          </div>
          {data.length - 1 !== index && <div className={styles.spaceAfterComments}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Posts;
