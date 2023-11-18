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

const PostDetails = () => {
  const { postId } = useParams();
  const [user] = useAuthState(auth);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = await getDoc(doc(firestore, 'posts', postId));
      if (postDoc.exists()) {
        setPost(postDoc.data());
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
      const commentsSnapshot = await getDocs(q);
      let newComments = [];
      commentsSnapshot.forEach(doc => {
        newComments.push({ id: doc.id, ...doc.data() });
      });
      setComments(newComments);
    };

    fetchComments();
  }, [postId]);

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    if (!replies[commentId]) {
      fetchReplies(commentId);
    }
  };

  const fetchReplies = async (commentId) => {
    const q = query(collection(firestore, 'replies'), where('commentId', '==', commentId), orderBy('createdAt'));
    const repliesSnapshot = await getDocs(q);
    let newReplies = {};
    repliesSnapshot.forEach(doc => {
      newReplies[doc.id] = { id: doc.id, ...doc.data() };
    });
    setReplies(prevReplies => ({ ...prevReplies, [commentId]: newReplies }));
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          {user && user.uid === comment.userId && (
            <>
              <EditComment comment={comment} />
              <DeleteComment commentId={comment.id} />
            </>
          )}
          <button onClick={() => toggleReplies(comment.id)}>
            {showReplies[comment.id] ? 'Hide Replies' : 'Show Replies'}
          </button>
          {showReplies[comment.id] && (
            <div>
              {replies[comment.id] && Object.values(replies[comment.id]).map(reply => (
                <div key={reply.id}>
                  <p>{reply.content}</p>
                  {user && user.uid === reply.userId && (
                    <>
                      <EditReply reply={reply} />
                      <DeleteReply replyId={reply.id} />
                    </>
                  )}
                </div>
              ))}
              <CreateReply commentId={comment.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostDetails;
