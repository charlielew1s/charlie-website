import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';

const postStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
};

const Posts = ({ data }) => {
    const [user] = useAuthState(auth);

    return (
        <div>
            {data.map((post, index) => (
                <div key={index} style={postStyle}>
                    {user && post.userID === user.uid && (
                        <>
                            <EditPost post={post} />
                            <DeletePost postId={post.id} />
                        </>
                    )}
                    <div><strong>Name:</strong> {post.name}</div>
                    <div><strong>Content:</strong> {post.content}</div>
                </div>
            ))}
        </div>
    );
}

export default Posts;