import React from "react";
import styles from './Home.module.css'

function Home(){
    const logout =()=>{
        localStorage.clear()
        window.location.reload()
    }
    return (
        <div>
        <button className={styles.button} onClick={logout}>Logout</button>
        <div className={styles.background}>
        </div>
        </div>
    );
    }
export default Home;