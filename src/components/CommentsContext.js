import React, { createContext, useState, useCallback } from 'react';
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from './config';

export const CommentsContext = createContext();

export const CommentsProvider = ({ children }) => {
    const [comments, setComments] = useState([]);
  
    const fetchComments = useCallback(async (postId) => {
        try {
            const querySnapshot = await getDocs(query(collection(firestore, 'comments'), where('postId', '==', postId)));
            const commentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments([...commentsData]); // Spread into a new array to ensure re-render
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }, []);
  
    return (
        <CommentsContext.Provider value={{ comments, fetchComments }}>
            {children}
        </CommentsContext.Provider>
    );
  };
  
