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
            </div>
            <div className="background">
                <p className="middle">RedditSimilar</p>
            </div>
            <div className="button">
                {value?<Home/>:
                <button onClick={handleClick}>Sign In with Google</button>
                }
            </div>
        </div>
    );
}

export default SignIn;
