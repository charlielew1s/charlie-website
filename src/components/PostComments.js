import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from './config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import styles from './Posts.module.css';

const PostComments = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            const postDoc = await firestore.collection('posts').doc(postId).get();
            setPost({ id: postDoc.id, ...postDoc.data() });

            const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
            const commentsSnapshot = await getDocs(q);
            const fetchedComments = [];
            commentsSnapshot.forEach(doc => {
                fetchedComments.push({ id: doc.id, ...doc.data() });
            });
            setComments(fetchedComments);
        };

        fetchPostAndComments();
    }, [postId]);

    return (
        <div>
            {post && (
                <div className={styles.postContainer}>
                    <div><strong>{post.name}</strong></div>
                    <div>{post.content}</div>
                    {comments.map(comment => (
                        <div key={comment.id} className={styles.commentContainer}>
                            <p>{comment.content}</p>
                            <EditComment comment={comment} />
                            <DeleteComment commentId={comment.id} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostComments;
