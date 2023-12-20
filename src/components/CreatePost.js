import React, { useState, useContext } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import styles from './CreatePost.module.css';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AddCircleIcon from '@mui/icons-material/AddCircle';
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

export default function BasicModal() {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const { fetchPosts } = useContext(AppContext); // Use AppContext instead of PostsContext

  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const post = {
      name: title,
      content: content,
      userID: user.uid,
    };

    const functions = getFunctions();
    const createPost = httpsCallable(functions, 'createPost');
    const res = await createPost(post);
    console.log(res);
    if (res.data) {
      setTimeout(fetchPosts, 5000);
    }
    handleClose();
  };

  return (
    <div>
      <div className={styles.modal_button}>
        <AddCircleIcon onClick={handleOpen}></AddCircleIcon>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create a New Post
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
            Submit
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
