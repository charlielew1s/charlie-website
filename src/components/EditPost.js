import React, { useState, useContext } from 'react';
import { Box, Button, Typography, Modal, TextField } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, provider } from './config';
import EditIcon from '@mui/icons-material/Edit';
import PostDetails from './PostDetails';
import { PostsContext } from './PostsContext'; // Import PostsContext

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

  const EditPost = ({ post }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(post.name);
    const [content, setContent] = useState(post.content);
    const { fetchPosts } = useContext(PostsContext); // Use PostsContext
    const auth = getAuth();
    const [user] = useAuthState(auth);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const updatedPost = {
      name: title,
      content: content,
      userID: user.uid
    };

    const functions = getFunctions();
    const editPost = httpsCallable(functions, 'editPost');
    editPost({ postId: post.id, ...updatedPost })
      .then((result) => {
        console.log(result);
        fetchPosts(); // Call fetchPosts after successful update
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    handleClose();
  };

  return (
    <div>
      <EditIcon onClick={handleOpen}></EditIcon>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Post
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            id="content"
            label="Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={handleSubmit} color="primary">
            Update
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default EditPost;