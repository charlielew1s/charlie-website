import React, { useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';

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
  

const EditReply = ({ reply }) => {
  const [open, setOpen] = useState(false);
  const [newContent, setNewContent] = useState(reply.content);
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEdit = () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const functions = getFunctions();
    const editReply = httpsCallable(functions, 'editReply');
    editReply({ replyId: reply.id, newContent })
      .then((result) => {
        console.log("Edit result:", result);
        handleClose();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleOpen}>
        Edit Reply
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Reply
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
            Update Reply
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default EditReply;
