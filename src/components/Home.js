import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import Posts from './Posts';
import CreatePost from './CreatePost'; 
import { signOut } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, provider } from './config';
import LogoutIcon from '@mui/icons-material/Logout';

function Home({ userEmail, onSignOut }) {
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
        signOut(auth).then(() => {
          localStorage.clear();
          if (onSignOut) {
            onSignOut();
          }
        }).catch((error) => {
          console.error("Error during sign-out:", error);
        });
      }

    return (
        <>
            <div className={styles.homeBanner}>RedditSimilar</div>
            <LogoutIcon className={styles.logoutButton} onClick={logout}>Logout</LogoutIcon>

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