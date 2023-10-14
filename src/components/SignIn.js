import React, { useEffect, useState } from "react";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import Home from "./Home";
import './SignIn.css'; // Importing the CSS file for styles

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
            <div className="banner">RedditSimilar
                <button className="button" onClick={handleClick}>Sign in with Google</button>
            </div>
            <div className="background">
            </div>
        </div>
    );
}

export default SignIn;
