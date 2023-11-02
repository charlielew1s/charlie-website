import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import Posts from './Posts';
import CreatePost from './CreatePost'; // Import the CreatePost component
import { getFunctions, httpsCallable } from "firebase/functions";

function Home({ userEmail }) {
    const [postData, setPostData] = useState([]);

    useEffect(() => {
        callFirebaseFunction();
    }, []);

    const callFirebaseFunction = () => {
        const functions = getFunctions();
        const getPosts = httpsCallable(functions, 'getPosts');
        getPosts()
            .then((result) => {
                setPostData(result.data || []);
            })
            .catch((error) => {
                console.error("Error fetching posts:", error);
            });
    }

    const logout = () => {
        localStorage.clear();
        window.location.reload(); // Or use a better method to inform App.js about the logout
    }

    return (
        <>
            <div className={styles.homeBanner}>RedditSimilar</div>
            <button className={styles.logoutButton} onClick={logout}>Logout</button>
            <button className={styles.createPostButton}>Create Post</button> {/* Assuming you have this button */}

            <div className={styles.homeContainer}>
                {/* Render the CreatePost component */}
                <CreatePost />

                {postData.length > 0 ? (
                    <Posts data={postData} />
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </>
    );
}

export default Home;
