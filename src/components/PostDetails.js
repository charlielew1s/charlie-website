
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import CreateReply from './CreateReply';
import EditReply from './EditReply';
import DeleteReply from './DeleteReply';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import homestyles from './Home.module.css'
import poststyles from './Posts.module.css'
import { Link, useNavigate } from 'react-router-dom'; // useNavigate for redirection
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateComment from './CreateComment';
import EditPost from './EditPost';
import DeletePost from './DeletePost';


const PostDetails = () => {
  const { postId } = useParams();
  const [user] = useAuthState(auth);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = await getDoc(doc(firestore, 'posts', postId));
      if (postDoc.exists()) {
        setPost(postDoc.data());
      }
    };

    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(q);
    const newComments = [];
    commentsSnapshot.forEach(doc => {
      newComments.push({ id: doc.id, ...doc.data() });
    });
    setComments(newComments);
  };

  const fetchReplies = async (commentId) => {
    const q = query(collection(firestore, 'replies'), where('commentId', '==', commentId), orderBy('createdAt'));
    const repliesSnapshot = await getDocs(q);
    const newReplies = [];
    repliesSnapshot.forEach(doc => {
      newReplies.push({ id: doc.id, ...doc.data() });
    });
    setReplies(prevReplies => ({ ...prevReplies, [commentId]: newReplies }));
  };

  useEffect(() => {
    comments.forEach(comment => {
      fetchReplies(comment.id);
    });
  }, [comments]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
  <>
    <div className={homestyles.homeBanner}>
      RedditSimilar
      <ArrowBackIcon className={homestyles.createPostButton} onClick={() => navigate(`/`)}>
    </ArrowBackIcon>
    </div>
    <div className={homestyles.homeContainer}>
      <p>Posted by: {post.username}</p>
      <h2>{post.name}</h2>
      <p>{post.content}</p>
      {user && user.uid === post.userID && (
          <div>
            <EditPost post={{ id: postId, ...post }} />
            <DeletePost postId={postId} />
          </div>
        )}
      <CreateComment postId={postId}/>
      {comments.map(comment => (
        <div key={comment.id} className={poststyles.commentContainer}>
          <p>Commented by: {comment.username}</p>
          <p>{comment.content}</p>
          {user && user.uid === comment.userID && (
            <>
              <EditComment comment={comment} />
              <DeleteComment commentId={comment.id} />
            </>
          )}
          <CreateReply commentId={comment.id} />
          {replies[comment.id] && replies[comment.id].map(reply => (
            <div key={reply.id} className={poststyles.replyContainer}>
              <p>Replied by: {reply.username}</p>
              <p>{reply.content}</p>
              {user && user.uid === reply.userId && (
                <>
                  <EditReply reply={reply} />
                  <DeleteReply replyId={reply.id} />
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  </>
  );
};

export default PostDetails;