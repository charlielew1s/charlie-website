import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from './components/config'; // Update this path as needed
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import styles from './Home.module.css'; // Assuming this contains the necessary styles

const PostWithComments = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            // Fetching the post
            const postRef = doc(firestore, 'posts', postId);
            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
                setPost({ id: postSnap.id, ...postSnap.data() });
            }

            // Fetching comments
            const commentsQuery = query(collection(firestore, 'comments'), where('postId', '==', postId));
            const commentsSnapshot = await getDocs(commentsQuery);
            const fetchedComments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(fetchedComments);
        };

        fetchPostAndComments();
    }, [postId]);

    return (
        <div className={styles.homeContainer}>
            {post && (
                <div className={styles.postContainer}>
                    <div><strong>{post.name}</strong></div>
                    <div>{post.content}</div>
                </div>
            )}
            <div>
                {comments.map(comment => (
                    <div key={comment.id} className={styles.commentContainer}>
                        <p>{comment.content}</p>
                        {/* Implement EditComment and DeleteComment functionality here */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostWithComments;
