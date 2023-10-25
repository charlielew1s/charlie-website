import Posts from './Posts';
import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import CreatePost from './CreatePost';
import { getFunctions, httpsCallable } from "firebase/functions";
import DeletePost from './DeletePost';
import EditPost from './EditPost';
function Home() {

    const [postData, setPostData] = useState(null);

    useEffect(() => {
        callFirebaseFunction();
    }, []);

    const logout = () => {
        localStorage.clear();
        window.location.reload();
    }

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
        <div>
            <button className={styles.button} onClick={logout}>Logout</button>
            <CreatePost/>
            <DeletePost/>
            <EditPost/>
            {postData && <Posts data={postData} />}
        </div>
  );
}
export default Home;

