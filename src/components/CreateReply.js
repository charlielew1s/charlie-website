import React, { useState } from 'react';
import { Box, Button, Typography, Modal, TextField } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';

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

const CreateReply = ({ commentId, postId }) => {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState('');
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const newReply = {
      commentId: commentId,
      postId: postId,
      content: reply,
      userID: user.uid
    };

    const functions = getFunctions();
    const createReply = httpsCallable(functions, 'createReply');
    createReply(newReply)
      .then((result) => {
        console.log(result);
        setReply(''); // Clear the reply field after submission
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    handleClose();
  };

  return (
    <div>
      <button onClick={handleOpen}>Reply</button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Write a Reply
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="reply"
            label="Reply"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
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

export default CreateReply;
