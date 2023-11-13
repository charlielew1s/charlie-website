import React, { useEffect, useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from './config';
import styles from './Home.module.css';
import Posts from './Posts';
import CreatePost from './CreatePost';
import { getFunctions, httpsCallable } from "firebase/functions";

function Home() {
    const [postData, setPostData] = useState([]);

    useEffect(() => {
        const functions = getFunctions();
        const getPosts = httpsCallable(functions, 'getPosts');
        getPosts()
            .then((result) => {
                setPostData(result.data.data || []);
            })
            .catch((error) => {
                console.error("Error fetching posts:", error);
            });
    }, []);

    const logout = () => {
        signOut(auth).catch((error) => {
            console.error("Error during sign-out:", error);
        });
    };

    return (
        <>
            <div className={styles.homeBanner}>RedditSimilar</div>
            <button className={styles.logoutButton} onClick={logout}>Logout</button>
            <div className={styles.homeContainer}>
                <CreatePost />
                <Posts data={postData} user={auth.currentUser} />
            </div>
        </>
    );
}

export default Home;
