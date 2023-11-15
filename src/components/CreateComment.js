import React, { useState } from 'react';
import { Box, Button, Typography, Modal, TextField } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import AddCommentIcon from '@mui/icons-material/AddComment';

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

const CreateComment = ({ postId }) => {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const newComment = {
      postId: postId,
      content: comment,
      userID: user.uid
    };

    const functions = getFunctions();
    const createComment = httpsCallable(functions, 'createComment');
    createComment(newComment)
      .then((result) => {
        console.log(result);
        setComment(''); // Clear the comment field after submission
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    handleClose();
  };

  return (
    <div>
      <AddCommentIcon onClick={handleOpen}></AddCommentIcon>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Write a Comment
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Comment"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleSubmit} color="primary">
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default CreateComment;