import React, { useEffect, useState } from "react";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import Home from "./Home";
import styles from './SignIn.module.css';
import { getFunctions, httpsCallable } from "firebase/functions";

function SignIn() {
    const [userEmail, setUserEmail] = useState(null);
    const [postData, setPostData] = useState(null);

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
        callFirebaseFunction()
    }, [])

    const callFirebaseFunction = event => {

        const functions = getFunctions();
        const getPosts = httpsCallable(functions, 'getPosts');
        getPosts()
          .then((result) => {
            console.log("result", result)
            // Read result of the Cloud Function.
            /** @type {any} */
            const data = result.data;
            console.log(data)
            setPostData(data)
            // const sanitizedMessage = data.text;
          })
          .catch((error) => {
            console.log(error)
            // Getting the Error details.
            const code = error.code;
            const message = error.message;
            const details = error.details;
            // ...
          });
    }


    return (
        <>
            <div className={styles.banner}>RedditSimilar</div>
            <div className={styles.container}>
                {userEmail ? (
                    <Home />
                ) : (
                    <>
                        <button className={styles.button} onClick={signIn}>
                            Sign In with Google
                        </button>
                        <div>
                            {JSON.stringify(postData)}
                        </div>
                    </>
                )}    
            </div>
        </>
    );
    

}
export default SignIn;
