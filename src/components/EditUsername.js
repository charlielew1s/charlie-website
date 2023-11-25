import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'; // Import getDoc here
import { firestore } from './config';

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

const EditUsername = ({ open, handleClose }) => {
    const [newUsername, setNewUsername] = useState('');
    const auth = getAuth();

    const handleUpdate = async () => {
        if (!auth.currentUser) {
            console.error('No user authenticated');
            return;
        }
    
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
    
        if (!docSnap.exists()) {
            // Create the document if it does not exist
            await setDoc(userRef, { username: newUsername });
        } else {
            // Update the document if it exists
            await updateDoc(userRef, { username: newUsername });
        }
    
        handleClose();
    };
    

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2">Edit Username</Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    id="newUsername"
                    label="New Username"
                    type="text"
                    fullWidth
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                />
                <Button onClick={handleUpdate} color="primary">
                    Update
                </Button>
            </Box>
        </Modal>
    );
};

export default EditUsername;
