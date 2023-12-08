import React, { useContext, useEffect, useState } from 'react';
import styles from './Home.module.css';
import Posts from './Posts';
import CreatePost from './CreatePost'; 
import { signOut } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, provider } from './config';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button } from '@mui/material'; 
import EditUsername from './EditUsername';
import { useNavigate } from 'react-router-dom';
import { PostsContext } from './PostsContext';

function Home({ userEmail, onSignOut }) {
    const [isEditUsernameOpen, setIsEditUsernameOpen] = useState(false);
    const navigate = useNavigate();
    const {posts, fetchPosts} = useContext(PostsContext)

    useEffect(() => {
        console.log('Component re-rendered with posts:', posts);
      }, [posts]);

    useEffect(()=> {
        fetchPosts();
    }, [fetchPosts]);
    
    const logout = () => {
        signOut(auth).then(() => {
          localStorage.clear();
          if (onSignOut) {
            onSignOut();
          }
        }).catch((error) => {
          console.error("Error during sign-out:", error);
        });
      }

    return (
        <>
            <div className={styles.homeBanner}>RedditSimilar
            <Button onClick={() => navigate('/personalized-feed')}>Personalized Feed</Button>
            <Button onClick={() => setIsEditUsernameOpen(true)}>Edit Username</Button>
            <EditUsername 
                open={isEditUsernameOpen} 
                handleClose={() => setIsEditUsernameOpen(false)}
            />
            </div>
            <LogoutIcon className={styles.logoutButton} onClick={logout}>Logout</LogoutIcon>

            <div className={styles.homeContainer}>
                {/* Render the CreatePost component */}
                <CreatePost />

                {posts.length > 0 ? (
                    <Posts data={posts} />
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </>
    );
}

export default Home;