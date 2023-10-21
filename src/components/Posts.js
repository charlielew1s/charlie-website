import React from 'react';

// Styles for the post container
const postStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px'
};

const Posts = ({ data }) => {
    return (
        <div>
            {data.map((post, index) => (
                <div key={index} style={postStyle}>
                    <div><strong>User ID:</strong> {post.userId}</div>
                    <div><strong>Name:</strong> {post.name}</div>
                    <div><strong>Content:</strong> {post.content}</div>
                </div>
            ))}
        </div>
    );
}

export default Posts;
