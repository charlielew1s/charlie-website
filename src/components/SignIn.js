import React, { useEffect, useState } from "react";
import { auth, provider } from "./config";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import Posts from './Posts'; // Ensure this import is correct
import { getFunctions, httpsCallable } from "firebase/functions";
import styles from './SignIn.module.css';

function SignIn() {
    const [user, setUser] = useState(null);
    const [postData, setPostData] = useState([]);

    // User authentication state check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
    
        return () => unsubscribe();
    }, []);
    
    

    // Fetching posts
    useEffect(() => {
        const functions = getFunctions();
        const getPosts = httpsCallable(functions, 'getPosts');
        getPosts()
            .then((result) => {
                setPostData(result.data || []);
            })
            .catch((error) => {
                console.error("Error fetching posts:", error);
            });
    }, []);
    


    const signIn = () => {
        signInWithPopup(auth, provider)
            .catch((error) => {
                console.error("Error during sign-in:", error);
            });
    };

    return (
        <>
            <div className={styles.signInBanner}>RedditSimilar
                {!user && (
                    <button className={styles.signInButton} onClick={signIn}>
                        Sign in with Google
                    </button>
                )}
            </div>
            <div className={styles.mainLayout}>
                <div className={styles.signInContainer}>
                    {postData.length > 0 ? (
                        <Posts data={postData} user={user} />
                    ) : (
                        <p>No posts available.</p>
                    )}
                </div>
            </div>
        </>
    );
    
    
}

export default SignIn;
