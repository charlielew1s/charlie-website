import React, { useEffect, useState } from "react";
import { auth, provider, firestore } from "./config"; // Import firestore
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import new firestore functions
import Home from "./Home";
import styles from './SignIn.module.css';
import Posts from './Posts';
import { getFunctions, httpsCallable } from "firebase/functions";
import LoginIcon from '@mui/icons-material/Login';

function SignIn({ onSignIn }) {
    const [userEmail, setUserEmail] = useState(null);

    const signIn = () => {
        signInWithPopup(auth, provider)
            .then(async (data) => {
                const email = data.user.email;
                const uid = data.user.uid;
                localStorage.setItem("email", email);
                await ensureUserDocument(uid); // Ensure the user document is created
                onSignIn(email); // Call the callback function
            })
            .catch((error) => {
                console.error("Error during sign-in:", error);
            });
    };

    const ensureUserDocument = async (userId) => {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                username: '', // Placeholder, should be updated later
                following: []
            });
        }
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
        console.log('here')
    }, []);

    const callFirebaseFunction = () => {
        const functions = getFunctions();
        const getPosts = httpsCallable(functions, 'getPosts');
        console.log('calling getPosts')
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
            <LoginIcon className={styles.signInButton} onClick={signIn}>Sign in with Google</LoginIcon>
            <div className={styles.mainLayout}>
                <div className={styles.signInContainer}>
                    {userEmail ? (
                        <Home userEmail={userEmail} />
                    ) : (
                        null
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
