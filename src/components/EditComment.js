// EditComment.js
import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const EditComment = ({ postId, comment }) => {
    const [newContent, setNewContent] = useState(comment.content);
    const [editing, setEditing] = useState(false);

    const editComment = httpsCallable(getFunctions(), 'editComment');

    const handleEdit = () => {
        editComment({ postId: postId, commentId: comment.id, newContent: newContent })
            .then(() => {
                // Handle the response
                console.log('Comment edited successfully');
                setEditing(false); // Exit editing mode
            })
            .catch((error) => {
                // Handle the error
                console.error('Error editing comment:', error);
            });
    };

    return (
        <div>
            {editing ? (
                <>
                    <input
                        type="text"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                    />
                    <button onClick={handleEdit}>Save</button>
                    <button onClick={() => setEditing(false)}>Cancel</button>
                </>
            ) : (
                <button onClick={() => setEditing(true)}>Edit</button>
            )}
        </div>
    );
};

export default EditComment;

