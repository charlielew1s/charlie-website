import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config'; // Ensure firestore is imported
import { getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore'; // Ensure all Firestore functions are imported
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import CreateReply from './CreateReply';
import EditReply from './EditReply';
import DeleteReply from './DeleteReply';
import homestyles from './Home.module.css';
import poststyles from './Posts.module.css';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateComment from './CreateComment';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '@mui/material/Button';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const PostDetails = () => {
  const { postId } = useParams();
  const [user] = useAuthState(auth);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const functions = getFunctions();
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

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

  const handleVote = async (postId, isUpvote) => {
    const functionName = isUpvote ? 'upvotePost' : 'downvotePost';
    const voteFunction = httpsCallable(functions, functionName);

    try {
      await voteFunction({ postId });
      // Implement logic to refresh or update post data after voting
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchComments = async () => {
    const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(q);
    const newComments = [];
    commentsSnapshot.forEach(doc => {
      newComments.push({ id: doc.id, ...doc.data() });
    });
    setComments(newComments);
  };

  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (user && post) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setIsFollowingAuthor(userDoc.data().following.includes(post.userID));
        }
      }
    };

    fetchFollowingStatus();
  }, [user, post]);
  
  const handleFollowUnfollow = async (userIdToFollow, isFollowing) => {
    const functionName = isFollowing ? 'unfollowUser' : 'followUser';
    const followFunction = httpsCallable(functions, functionName);
  
    try {
      await followFunction({ userId: userIdToFollow });
      setIsFollowingAuthor(!isFollowing);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <>
      <div className={homestyles.homeBanner}>
        <ArrowBackIcon onClick={() => navigate(`/`)} />
        RedditSimilar
      </div>
      <div className={homestyles.homeContainer}>
        {post && (
          <>
            <div className={poststyles.postDetails}>
              <div className={poststyles.userAndFollow}>
                <Link to={`/user/${post.userID}`}>{post.username}</Link>
                {user && user.uid !== post.userID && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleFollowUnfollow(post.userID, isFollowingAuthor)}
                  >
                    {isFollowingAuthor ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
              <h2>{post.name}</h2>
              <p>{post.content}</p>
              <div className={poststyles.voteContainer}>
                <ArrowUpwardIcon onClick={() => handleVote(postId, true)} />
                <span>{post.votes}</span>
                <ArrowDownwardIcon onClick={() => handleVote(postId, false)} />
              </div>
              {user && user.uid === post.userID && (
                <div>
                  <EditPost post={{ id: postId, ...post }} />
                  <DeletePost postId={postId} />
                </div>
              )}
            </div>
            <CreateComment postId={postId} />
            {comments.map(comment => (
              <div key={comment.id} className={poststyles.commentContainer}>
                <Link to={`/user/${comment.userID}`}>{comment.username}</Link>
                <p>{comment.content}</p>
                {user && user.uid === comment.userID && (
                  <>
                    <EditComment comment={comment} />
                    <DeleteComment commentId={comment.id} />
                  </>
                )}
                <CreateReply commentId={comment.id} />
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default PostDetails;
