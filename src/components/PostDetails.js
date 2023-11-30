import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import CreateReply from './CreateReply';
import EditReply from './EditReply';
import DeleteReply from './DeleteReply';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateComment from './CreateComment';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import { Link, useNavigate } from 'react-router-dom';
import homestyles from './Home.module.css';
import poststyles from './Posts.module.css';
import { Button } from '@mui/material';

const PostDetails = () => {
  const { postId } = useParams();
  const [user] = useAuthState(auth);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();
  const functions = getFunctions();

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = await getDoc(doc(firestore, 'posts', postId));
      if (postDoc.exists()) {
        setPost(postDoc.data());
      }
    };

    const fetchFollowing = async () => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setFollowing(userDoc.data().following || []);
        }
      }
    };

    fetchPost();
    fetchFollowing();
    fetchComments();
  }, [postId, user]);

  const fetchComments = async () => {
    const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(q);
    const newComments = [];
    commentsSnapshot.forEach(doc => {
      newComments.push({ id: doc.id, ...doc.data() });
    });
    setComments(newComments);
  };

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
    <>
      <div className={homestyles.homeBanner}>
        RedditSimilar
        <ArrowBackIcon className={homestyles.createPostButton} onClick={() => navigate(`/`)} />
      </div>
      <div className={homestyles.homeContainer}>
        {post && (
          <>
            <div className={poststyles.userAndFollow}>
              <Link to={`/user/${post.userID}`}>{post.username}</Link>
              {user && user.uid !== post.userID && (
                <Button variant="outlined" size="small" onClick={() => handleFollowUnfollow(post.userID, following.includes(post.userID))}>
                  {following.includes(post.userID) ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
            <h2>{post.name}</h2>
            <p>{post.content}</p>
            {user && user.uid === post.userID && (
              <div>
                <EditPost post={{ id: postId, ...post }} />
                <DeletePost postId={postId} />
              </div>
            )}
            <CreateComment postId={postId} />
            {comments.map(comment => (
              <div key={comment.id} className={poststyles.commentContainer}>
                <div className={poststyles.userAndFollow}>
                  <Link to={`/user/${comment.userID}`}>{comment.username}</Link>
                  {user && user.uid !== comment.userID && (
                    <Button variant="outlined" size="small" onClick={() => handleFollowUnfollow(comment.userID, following.includes(comment.userID))}>
                      {following.includes(comment.userID) ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </div>
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
                    <div className={poststyles.userAndFollow}>
                      <Link to={`/user/${reply.userId}`}>{reply.username}</Link>
                      {user && user.uid !== reply.userId && (
                        <Button variant="outlined" size="small" onClick={() => handleFollowUnfollow(reply.userId, following.includes(reply.userId))}>
                          {following.includes(reply.userId) ? 'Unfollow' : 'Follow'}
                        </Button>
                      )}
                    </div>
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
          </>
        )}
      </div>
    </>
  );
};

export default PostDetails;