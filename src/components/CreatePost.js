import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import styles from './CreatePost.module.css'

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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    // Here, you can handle your form submission logic (e.g., send it to a server)
    console.log('Title:', title);
    console.log('Content:', content);

    // After submitting, close the modal
    handleClose();
  };

  return (
    <div>
        <div className={styles.modal_button}>
            <Button onClick={handleOpen}>Create Post</Button>
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
