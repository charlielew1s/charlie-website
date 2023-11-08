import React, { useEffect, useState } from "react";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import Home from "./Home";
import styles from './SignIn.module.css';
import Posts from './Posts';
import { getFunctions, httpsCallable } from "firebase/functions";


function SignIn({ onSignIn }) { // Ensure onSignIn is included here
    const [userEmail, setUserEmail] = useState(null);


    const signIn = () => {
        signInWithPopup(auth, provider)
            .then((data) => {
                const email = data.user.email;
                localStorage.setItem("email", email);
                onSignIn(email); // Call the callback function
            })
            .catch((error) => {
                console.error("Error during sign-in:", error);
            });
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setUserEmail(storedEmail);
        }
    }, []);

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
    return (
        <>
            <div className={styles.signInBanner}>RedditSimilar</div>
            <div className={styles.mainLayout}>
                <div className={styles.signInContainer}>
                    {userEmail ? (
                        <Home userEmail={userEmail} />
                    ) : (
                        <button className={styles.signInButton} onClick={signIn}>
                            Sign In with Google
                        </button>
                    )}
                    {postData.length > 0 ? (
                        <Posts data={postData} />
                    ) : (
                        <p>No posts available.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default SignIn;