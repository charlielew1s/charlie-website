import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'; // Import useAuthState
import { auth } from './config'; // Ensure you have auth exported from config
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './config';
import styles from './Posts.module.css';
import pagestyles from './Home.module.css';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';

const PostDetails = () => {
  const { postId } = useParams();
  const [user] = useAuthState(auth); // Get the current user
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      // Fetch post data
      const postRef = doc(firestore, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        setPost({ id: postDoc.id, ...postDoc.data() });
      }
  
      // Fetch comments data
      const commentsQuery = query(collection(firestore, 'comments'), where('postId', '==', postId));
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = [];
      commentsSnapshot.forEach(doc => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsData);
    };
  
    fetchPostAndComments();
  }, [postId]);

  if (!post) {
    return <div>Loading post...</div>;
  }

  return (
    <div>
      <div className={pagestyles.homeBanner}>
        RedditSimilar
        <div className={pagestyles.logoutButton}>Press back arrow on your browser to go back</div>
      </div>
      <div className={pagestyles.homeContainer}>
        <div className={styles.postContainer}>
          <div><strong>{post.name}</strong></div>
          <div>{post.content}</div>
        </div>
        <div className={styles.commentsSection}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.commentContainer}>
              <p>{comment.content}</p>
                <div>
                  <EditComment comment={comment} />
                  <DeleteComment commentId={comment.id} />
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}  

export default PostDetails