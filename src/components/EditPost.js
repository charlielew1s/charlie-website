import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import styles from './EditPost.module.css';
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

export default function EditPostModal() {
  const [open, setOpen] = React.useState(false);
  const [nestedOpen, setNestedOpen] = React.useState(false);
  const [oldTitle, setOldTitle] = React.useState('');
  const [oldContent, setOldContent] = React.useState('');
  const [newTitle, setNewTitle] = React.useState('');
  const [newContent, setNewContent] = React.useState('');

  const auth = getAuth();
  const [user] = useAuthState(auth);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleNestedOpen = () => setNestedOpen(true);
  const handleNestedClose = () => setNestedOpen(false);

  const handleSubmit = () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    // Open the nested modal for entering new post details
    handleNestedOpen();
  };

  const handleNestedSubmit = () => {
    const postData = {
      oldName: oldTitle,
      oldContent: oldContent,
      newName: newTitle,
      newContent: newContent,
      userID: user.uid
    };

    const functions = getFunctions();
    const editPostByAttributes = httpsCallable(functions, 'editPostByAttributes');
    editPostByAttributes(postData)
      .then((result) => {
        console.log(result);
        handleNestedClose();
        handleClose();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
        <div className={styles.modal_button}>
            <Button onClick={handleOpen}>Edit Post</Button>
        </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Post by Attributes
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="old-title"
            label="Old Title"
            type="text"
            fullWidth
            variant="standard"
            value={oldTitle}
            onChange={(e) => setOldTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            id="old-content"
            label="Old Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={oldContent}
            onChange={(e) => setOldContent(e.target.value)}
          />
          <Button onClick={handleSubmit} color="primary">
            Next
          </Button>

          <Modal
            open={nestedOpen}
            onClose={handleNestedClose}
            aria-labelledby="nested-modal-title"
            aria-describedby="nested-modal-description"
          >
            <Box sx={style}>
              <Typography id="nested-modal-title" variant="h6" component="h2">
                Enter New Post Details
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="new-title"
                label="New Title"
                type="text"
                fullWidth
                variant="standard"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <TextField
                margin="dense"
                id="new-content"
                label="New Content"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="standard"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
              <Button onClick={handleNestedSubmit} color="primary">
                Update
              </Button>
            </Box>
          </Modal>
        </Box>
      </Modal>
    </div>
  );
}
