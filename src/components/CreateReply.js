import React, { useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import CommentIcon from '@mui/icons-material/Comment';


const modalStyle = {
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

const CreateReply = ({ commentId }) => {
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
      content: reply,
      userId: user.uid
    };

    const functions = getFunctions();
    const createReply = httpsCallable(functions, 'createReply');
    createReply(newReply)
      .then((result) => {
        console.log(result);
        setReply('');
        console.log('Closing modal now'); // Add this line
        handleClose();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <CommentIcon onClick={handleOpen}>
        Reply
      </CommentIcon>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
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
          <Button onClick={handleSubmit} color="primary">
            Submit Reply
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default CreateReply;
