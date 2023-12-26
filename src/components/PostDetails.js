import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirestore, getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './config';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import CreateReply from './CreateReply';
import EditReply from './EditReply';
import DeleteReply from './DeleteReply';
import CreateComment from './CreateComment';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import Button from '@mui/material/Button';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import homestyles from './Home.module.css';
import poststyles from './Posts.module.css';
import { AppContext } from './AppContext'; // Import AppContext

const PostDetails = () => {
  const { postId } = useParams();
  const [user] = useAuthState(auth);
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const db = getFirestore();
  const functions = getFunctions();
  const navigate = useNavigate();
  
  // Use AppContext
  const { fetchPosts, updateFlag } = useContext(AppContext);
  const { comments, fetchComments } = useContext(AppContext);

  const fetchPostDetails = async () => {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        setPost({ id: postDoc.id, ...postDoc.data() });
        checkIfFollowingAuthor(postDoc.data().userID);
      }

      fetchComments(postId);

      let repliesData = [];
      for (const comment of comments) {
        const repliesSnapshot = await getDocs(query(collection(db, 'replies'), where('commentId', '==', comment.id)));
        const commentReplies = repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        repliesData = [...repliesData, ...commentReplies];
      }
      setReplies(repliesData);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [postId, updateFlag, fetchPostDetails]); // Add fetchPostDetails as a dependency

  const checkIfFollowingAuthor = async (authorId) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const isFollowing = userDoc.data().following.includes(authorId);
        setIsFollowingAuthor(isFollowing);
      }
    }
  };


  const handleVote = async (itemId, isUpvote, itemType) => {
    const functionName = isUpvote ? 'upvote' : 'downvote';
    const voteFunction = httpsCallable(functions, functionName);
    const collectionName = itemType === 'post' ? 'posts' : (itemType === 'comment' ? 'comments' : 'replies');
  
    try {
      await voteFunction({ documentId: itemId, collection: collectionName });
      fetchPostDetails(); // Re-fetch post details after voting
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
        RedditSimilar
      </div>
      <ArrowBackIcon className={homestyles.createPostButton} onClick={() => navigate(`/`)} />
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
                <ArrowUpwardIcon onClick={() => handleVote(post.id, true, 'post')} />
                <span>{post.votes}</span>
                <ArrowDownwardIcon onClick={() => handleVote(post.id, false, 'post')} />
              </div>
              {user && user.uid === post.userID && (
                <div>
                  <EditPost post={{ id: postId, ...post }} fetchPosts={fetchPosts} />
                  <DeletePost postId={postId} />
                </div>
              )}
            </div>
            <CreateComment postId={postId} />
            {comments.map(comment => (
              <div key={comment.id} className={poststyles.commentContainer}>
                <Link to={`/user/${comment.userID}`}>{comment.username}</Link>
                <p>{comment.content}</p>
                <div className={poststyles.voteContainer}>
                  <ArrowUpwardIcon onClick={() => handleVote(comment.id, true, 'comment')} />
                  <span>{comment.votes}</span>
                  <ArrowDownwardIcon onClick={() => handleVote(comment.id, false, 'comment')} />
                </div>
                {user && user.uid === comment.userID && (
                  <>
                    <EditComment comment={comment} />
                    <DeleteComment commentId={comment.id} />
                  </>
                )}
                <CreateReply commentId={comment.id} />
                {replies.filter(reply => reply.commentId === comment.id).map(reply => (
                  <div key={reply.id} className={poststyles.replyContainer}>
                    <p>{reply.content}</p>
                    <div className={poststyles.voteContainer}>
                      <ArrowUpwardIcon onClick={() => handleVote(reply.id, true, 'reply')} />
                      <span>{reply.votes}</span>
                      <ArrowDownwardIcon onClick={() => handleVote(reply.id, false, 'reply')} />
                    </div>
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