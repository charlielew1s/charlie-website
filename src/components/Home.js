import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import CreatePost from './CreatePost';
function Home() {

    const logout = () => {
        localStorage.clear();
        window.location.reload();
    }

    return (
        <div>
            <button className={styles.button} onClick={logout}>Logout</button>
            <CreatePost/>
        </div>
  );
}
export default Home;

