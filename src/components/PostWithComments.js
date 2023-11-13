import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from './config'; // Ensure this path is correct
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import styles from './Posts.module.css';

const PostWithComments = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            const postRef = doc(firestore, 'posts', postId);
            const postDoc = await getDoc(postRef);
            if (postDoc.exists()) {
                setPost({ id: postDoc.id, ...postDoc.data() });
            }

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
                    {/* Additional post details if needed */}
                </div>
            )}
            <div>
                {comments.map(comment => (
                    <div key={comment.id} className={styles.commentContainer}>
                        <p>{comment.content}</p>
                        <EditComment comment={comment} />
                        <DeleteComment commentId={comment.id} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostWithComments;
