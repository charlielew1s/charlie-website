import React, { useEffect, useState } from "react";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import Home from "./Home";
import styles from './SignIn.module.css';





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
    }, [])

    const renderPost = async () => {
        try {
            let response = await fetch("https://us-central1-charlie-website-2550b.cloudfunctions.net/getPosts");
            let data = await response.text();  
            return data;
        } catch (error) {
            console.error("Error fetching posts:", error);
            return null; 
        }
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
                        {async () => {
                            const data = await renderPost();
                            setPostData(data);
                        }}
                        <div>
                            {postData}
                        </div>
                    </>
                )}    
            </div>
        </>
    );
    

}
export default SignIn;
