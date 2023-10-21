import React, { useState } from 'react';
import styles from './CreatePost.module.css';

function CreatePost() {
    const [userID, setUserID] = useState('');
    const [name, setName] = useState('');
    const [content, setContent] = useState('');

    return (
        <div className={styles.fullPage}>
            <div className={styles.userID}>
                <label htmlFor="userID">User ID:</label>
                <input 
                    type="text" 
                    id="userID" 
                    value={userID} 
                    onChange={e => setUserID(e.target.value)} 
                />
            </div>
            <div>
                <label htmlFor="name">Name:</label>
                <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                />
            </div>
            <div>
                <label htmlFor="content">Content:</label>
                <input 
                    type="text" 
                    id="content" 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                />
            </div>
        </div>
    );
}

export default CreatePost;
