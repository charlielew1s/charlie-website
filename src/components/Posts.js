import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './config';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import CreateComment from './CreateComment';
import { collection, query, where, getDocs } from "firebase/firestore";
// Import EditComment and DeleteComment components

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

// Comment component placeholder
const Comment = ({ comment }) => (
    <div>
        <p>{comment.content}</p>
        {/* Render Edit and Delete buttons if the user owns this comment */}
        {/* <EditComment comment={comment} />
        <DeleteComment commentId={comment.id} /> */}
    </div>
);

const Posts = ({ data }) => {
    const [user] = useAuthState(auth);
    const [comments, setComments] = useState({}); // This will hold comments for all posts

    // Fetch comments for a post
    const fetchComments = async (postId) => {
        const q = query(collection(firestore, 'comments'), where('postId', '==', postId));
        const commentsSnapshot = await getDocs(q);
        const commentsForPost = [];
        console.log('comments: ', commentsSnapshot)
        commentsSnapshot.forEach(doc => {
            commentsForPost.push({ id: doc.id, ...doc.data() });
        });
        setComments(prevComments => ({ ...prevComments, [postId]: commentsForPost }));
    };

    // Use useEffect to fetch comments when the component mounts or data changes
    useEffect(() => {
        data.forEach(post => {
            fetchComments(post.id);
        });
    }, [data]);

    // Function to render comments
    const renderComments = (postId) => {
        const commentsForPost = comments[postId] || [];
        return (
            <div>
                {commentsForPost.map(comment => (
                    <Comment key={comment.id} comment={comment} />
                ))}
            </div>
        );
    };

    return (
        <div>
            {data.map((post) => (
                <div key={post.id} style={postStyle}>
                    {user && post.userID === user.uid && (
                        <div style={buttonContainerStyle}>
                            <EditPost post={post} />
                            <DeletePost postId={post.id} />
                        </div>
                    )}
                    <div><strong>{post.name}</strong></div>
                    <br />
                    <div>{post.content}</div>
                    {/* Render comments for this post */}
                    {renderComments(post.id)}
                    {/* Conditionally render the CreateComment button */}
                    {user && <CreateComment postId={post.id} />}
                    {/* You will need to add EditComment and DeleteComment components as needed */}
                </div>
            ))}
        </div>
    );
}

export default Posts;

