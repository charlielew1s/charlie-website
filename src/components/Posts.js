import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';


const postStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    margin: '10px auto', // center the post
    borderRadius: '5px',
    maxWidth: '600px', // set a maximum width
    width: '100%' // ensure it takes the full width on smaller screens
};

const buttonContainerStyle = {
    display: 'flex', // Use flexbox for horizontal layout
    justifyContent: 'start', // Align buttons to the start of the container
    gap: '10px', // Space between buttons
    marginBottom: '10px', // Space below the button container
};


const Posts = ({ data }) => {
    const [user] = useAuthState(auth);

    return (
        <div>
            {data.map((post, index) => (
                <div key={index} style={postStyle}>
                    {user && post.userID === user.uid && (
                        <div style={buttonContainerStyle}>
                            <EditPost post={post} />
                            <DeletePost postId={post.id} />
                        </div>
                    )}
                    <div><strong>{post.name}</strong></div>
                    <br />
                    <div>{post.content}</div>
                </div>
            ))}
        </div>
    );
}

export default Posts;