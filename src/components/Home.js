import React, { useState } from 'react';
import styles from './Home.module.css';
import CreatePost from './CreatePost';

function Home() {
   
    const [showCreatePost, setShowCreatePost] = useState(false);

    const logout = () => {
        localStorage.clear();
        window.location.reload();
    }

    return (
        <div>
            <button className={styles.button} onClick={logout}>Logout</button>
            <button className={styles.createPostButton} onClick={() => setShowCreatePost(true)}>Create post</button>
            
            {showCreatePost && <CreatePost />}
        </div>
  );
}

export default Home;

