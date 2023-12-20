import React, { useContext } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppContext } from './AppContext'; // Import AppContext

const DeleteComment = ({ commentId, postId }) => {
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [open, setOpen] = React.useState(false);

    // Use the context
    const { fetchComments } = useContext(AppContext);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = () => {
        if (!user) {
            console.error("User is not authenticated");
            return;
        }

        const deleteComment = httpsCallable(getFunctions(), 'deleteComment');
        deleteComment({ commentId })
            .then(() => {
                console.log('Comment deleted successfully');
                handleClose();
                fetchComments(postId); // Refresh comments after deletion
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <div>
            <DeleteIcon onClick={handleClickOpen}></DeleteIcon>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this comment?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleDelete} autoFocus color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DeleteComment;

