import React, { useState } from 'react';
import { Box, Button, Typography, Modal, TextField } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const EditComment = ({ comment }) => {
  const [open, setOpen] = useState(false);
  const [newContent, setNewContent] = useState(comment.content);
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEdit = () => {
    console.log("Current user:", user); // Log the current user object
    if (!user) {
      console.error("User is not authenticated");
      return;
    }
  
    console.log("Editing comment with ID:", comment.id, "New content:", newContent); // Log the comment ID and new content
  
    const editComment = httpsCallable(getFunctions(), 'editComment');
    editComment({ commentId: comment.id, newContent }) // No need to include userID here anymore
      .then((result) => {
        console.log("Edit result:", result); // Log the result of the edit
        handleClose();
      })
      .catch((error) => {
        console.error('Error:', error); // Log any errors that occur
      });
  };
  

  return (
    <div>
      <button onClick={handleOpen}>Edit Comment</button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Comment
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="newContent"
            label="New Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <Button onClick={handleEdit} color="primary">
            Update
          </Button>
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default EditComment;