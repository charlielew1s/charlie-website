import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import { collection, query, where, getDocs } from 'firebase/firestore';

const postStyle = {
  border: '1px solid #ccc',
  padding: '10px',
  margin: '10px auto',
  borderRadius: '5px',
  maxWidth: '600px',
  width: '100%'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'start',
  gap: '10px',
  marginBottom: '10px'
};

// Comment component placeholder
const Comment = ({ comment, postId, currentUser }) => (
    <div>
      <p>{comment.content}</p>
      {/* Only show edit and delete buttons if the current user created this comment */}
      {currentUser && currentUser.uid === comment.userID && (
        <>
          <EditComment postId={postId} comment={comment} />
          <DeleteComment commentId={comment.id} />
        </>
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
        <div key={post.id} style={postStyle}>
          {user && post.userID === user.uid && (
            <div style={buttonContainerStyle}>
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


