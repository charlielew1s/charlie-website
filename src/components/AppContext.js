import React, { createContext, useState, useCallback } from 'react';
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from './config';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);
    const [updateFlag, setUpdateFlag] = useState(false);

    const toggleUpdateFlag = () => setUpdateFlag(flag => !flag);

    const fetchPosts = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, 'posts'));
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }, []);

    const fetchComments = useCallback(async (postId) => {
        try {
            const querySnapshot = await getDocs(query(collection(firestore, 'comments'), where('postId', '==', postId)));
            const commentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments([...commentsData]);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }, []);

    const fetchReplies = useCallback(async (commentId) => {
        try {
            const querySnapshot = await getDocs(query(collection(firestore, 'replies'), where('commentId', '==', commentId)));
            const repliesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReplies([...repliesData]);
        } catch (error) {
            console.error('Error fetching replies:', error);
        }
    }, []);

    return (
        <AppContext.Provider value={{ posts, fetchPosts, comments, fetchComments, replies, fetchReplies, updateFlag, toggleUpdateFlag }}>
            {children}
        </AppContext.Provider>
    );
};

