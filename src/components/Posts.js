import React from 'react';
import styles from './Posts.module.css';
import EditPost from './EditPost';
import DeletePost from './DeletePost';

const Posts = ({ data, user }) => {
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
                    {/* other post details */}
                </div>
            ))}
        </div>
    );
};

export default Posts;
