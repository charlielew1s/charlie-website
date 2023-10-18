import React, { useEffect, useState } from "react";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import Home from "./Home";
import styles from './SignIn.module.css';


function SignIn() {
    const [userEmail, setUserEmail] = useState(null);

    const signIn = () => {
        signInWithPopup(auth, provider)
            .then((data) => {
                const email = data.user.email;
                setUserEmail(email);
                localStorage.setItem("email", email);
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

    return (
        <>
            <div className={styles.banner}>RedditSimilar</div>
            <div className={styles.container}>
                {userEmail ? (
                    <Home />
                ) : (
                    <button className={styles.button} onClick={signIn}>
                        Sign In with Google
                    </button>
                )}
            </div>
        </>
    );
}

export default SignIn;
