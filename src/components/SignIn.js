import React, { useEffect, useState } from "react";
import { auth, provider } from "./config";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import Posts from './Posts';
import { getFunctions, httpsCallable } from "firebase/functions";
import styles from './SignIn.module.css';

function SignIn() {
    const [user, setUser] = useState(null);
    const [postData, setPostData] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            const functions = getFunctions();
            const getPosts = httpsCallable(functions, 'getPosts');
            getPosts()
                .then((result) => {
                    setPostData(result.data.data || []);
                })
                .catch((error) => {
                    console.error("Error fetching posts:", error);
                });
        }
    }, [user]);

    const signIn = () => {
        signInWithPopup(auth, provider)
            .catch((error) => {
                console.error("Error during sign-in:", error);
            });
    };

    return (
        <>
            <div className={styles.signInBanner}>RedditSimilar</div>
            {user === null && (
                <>
                    <button className={styles.signInButton} onClick={signIn}>
                        Sign in with Google
                    </button>
                    <Posts data={postData} />
                </>
            )}
        </>
    );
}

export default SignIn;
