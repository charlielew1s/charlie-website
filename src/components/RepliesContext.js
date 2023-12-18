import React, { createContext, useState, useCallback } from 'react';
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from './config';

export const RepliesContext = createContext();

export const RepliesProvider = ({ children }) => {
    const [replies, setReplies] = useState([]);

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
        <RepliesContext.Provider value={{ replies, fetchReplies }}>
            {children}
        </RepliesContext.Provider>
    );
};
