import React, { useState, useContext } from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppContext } from './AppContext'; // Import AppContext

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

const DeletePost = ({ postId }) => {
  const [open, setOpen] = useState(false);
  const { fetchPosts, toggleUpdateFlag } = useContext(AppContext); // Use AppContext
  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const functions = getFunctions();
    const deletePost = httpsCallable(functions, 'deletePost');
    deletePost({ postId: postId })
      .then((result) => {
        console.log(result);
        fetchPosts(); // Call fetchPosts after successful deletion
        toggleUpdateFlag(); // Toggle the flag after successful deletion
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    handleClose();
  };

  return (
    <div>
      <DeleteIcon onClick={handleOpen}></DeleteIcon>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Confirm Deletion
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete this post?
          </Typography>
          <Button onClick={handleDelete} color="primary">
            Delete
          </Button>
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default DeletePost;
