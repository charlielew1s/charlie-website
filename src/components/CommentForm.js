import React, { useState } from 'react';
import { db } from './config';
import { addDoc, collection } from 'firebase/firestore';

const CommentForm = ({ postId }) => {
    const [comment, setComment] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Assuming `auth` is your Firebase auth instance and `db` is your Firestore instance
        if (auth.currentUser) {
            const commentRef = collection(db, 'posts', postId, 'comments');
            await addDoc(commentRef, {
                content: comment,
                userID: auth.currentUser.uid,
                createdAt: new Date()
            });
            setComment(''); // Clear the input after submitting
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default CommentForm;