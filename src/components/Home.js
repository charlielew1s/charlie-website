import React, { useState } from 'react';
import styles from './Home.module.css';

function Home() {
    const [posts, setPosts] = useState([]);
    const [showPosts, setShowPosts] = useState(false); // state to control when to display the posts

    const fetchPosts = async () => {
        try {
            const response = await fetch('https://us-central1-charlie-website-2550b.cloudfunctions.net/getPosts');
            const data = await response.json();
            setPosts(data);
            setShowPosts(true); // Display posts after fetching
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }

    const logout = () => {
        localStorage.clear();
        window.location.reload();
    }

    return (
        <div>
            <button className={styles.button} onClick={logout}>Logout</button>
            <button onClick={fetchPosts}>Fetch Posts</button>
            
            {showPosts && (
                <div className={styles.postsContainer}>
                    {posts.map(post => (
                        <div key={post.id} className={styles.post}>
                            {/* Render post content here. 
                                 This assumes each post has an 'id' and you can adjust accordingly. */}
                            <h2>{post.title}</h2>
                            <p>{post.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;
