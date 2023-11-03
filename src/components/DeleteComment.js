// DeleteComment.js
import React from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const DeleteComment = ({ postId, commentId }) => {
    const deleteComment = httpsCallable(getFunctions(), 'deleteComment');

    const handleDelete = () => {
        deleteComment({ postId: postId, commentId: commentId })
            .then(() => {
                // Handle the response
                console.log('Comment deleted successfully');
            })
            .catch((error) => {
                // Handle the error
                console.error('Error deleting comment:', error);
            });
    };

    return (
        <button onClick={handleDelete}>Delete</button>
    );
};

export default DeleteComment;
