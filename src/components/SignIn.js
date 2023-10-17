import React, { useEffect, useState } from "react";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import Home from "./Home";
import styles from './SignIn.module.css'; // Importing the CSS file for styles

function SignIn(){
    const [value,setValue] = useState('')
    const handleClick =()=>{
        signInWithPopup(auth,provider).then((data)=>{
            setValue(data.user.email)
            localStorage.setItem("email",data.user.email)
        })
    }

    useEffect(()=>{
        setValue(localStorage.getItem('email'))
    })

    return (
        <div>
            <div className={styles.banner}>RedditSimilar
            </div>
            <div className={styles.background}>
                <div className={styles.middle}>
                    RedditSimilar
            </div>
            </div>
            <div className={styles.background}>
                {value?<Home/>:
                <button className={styles.button} onClick={handleClick}>Sign In with Google</button>
                }
            </div>
        </div>
    );
}

export default SignIn;
