import React, { createContext, useState, useCallback } from 'react';
import { getDocs, collection } from "firebase/firestore";
import { firestore } from './config'; // Importing firestore instead of db

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);

    const fetchPosts = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, 'posts'));
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData); // This should trigger a re-render
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }, []);
    

    return (
        <PostsContext.Provider value={{ posts, fetchPosts }}>
            {children}
        </PostsContext.Provider>
    );
};
