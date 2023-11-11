import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import EditComment from './EditComment';
import DeleteComment from './DeleteComment';
import styles from './Posts.module.css';

const Posts = ({ data }) => {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    const viewComments = (postId) => {
        navigate(`/comments/${postId}`);
    };

    return (
        <div>
            {data.map((post) => (
                <div key={post.id} className={styles.postContainer}>
                    {user && user.uid === post.userID && (
                        <div className={styles.buttonContainer}>
                            <EditPost post={post} />
                            <DeletePost postId={post.id} />
                        </div>
                    )}
                    <div><strong>{post.name}</strong></div>
                    <div>{post.content}</div>
                    {user && <CreateComment postId={post.id} />}
                    <button onClick={() => viewComments(post.id)}>Comments</button>
                </div>
            ))}
        </div>
    );
};

export default Posts;

