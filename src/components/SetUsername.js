import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import styles from './SetUsername.module.css';

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

function SetUsernameModal() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSetUsername = () => {
        const functions = getFunctions();
        const setUsernameFunction = httpsCallable(functions, 'setUsername');
        
        setUsernameFunction({ desiredUsername: username })
            .then((result) => {
                console.log(result);
                handleClose();
            })
            .catch((error) => {
                if (error.code === 'already-exists') {
                    setError('This username is already taken.');
                } else {
                    setError('Failed to set username.');
                }
            });
    };

    return (
        <div>
            <div className={styles.modal_button}>
                <Button onClick={handleOpen}>Set/Change Username</Button>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={modalStyle}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Set or Change Your Username
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Username"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {error && <div style={{color: 'red'}}>{error}</div>}
                    <Button onClick={handleSetUsername} color="primary">
                        Submit
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}

export default SetUsernameModal;
