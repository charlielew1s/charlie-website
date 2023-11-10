import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from './config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from './Posts.module.css'; // Reuse the same styles

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      // Fetch post data
      const postDoc = await firestore.collection('posts').doc(postId).get();
      setPost({ id: postDoc.id, ...postDoc.data() });

      // Fetch comments data
      const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
      const commentsSnapshot = await getDocs(q);
      const commentsData = [];
      commentsSnapshot.forEach(doc => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsData);
    };

    fetchPostAndComments();
  }, [postId]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className={styles.postContainer}>
      <div><strong>{post.name}</strong></div>
      <div>{post.content}</div>
      <div className={styles.commentsSection}>
        {comments.map(comment => (
          <div key={comment.id} className={styles.commentContainer}>
            <p>{comment.content}</p>
            {/* Add Edit and Delete Comment functionality */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostDetails;
