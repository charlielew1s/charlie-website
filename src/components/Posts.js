import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config'; 

// Styles for the post container
const postStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px'
};

const Posts = ({ data }) => {
    const [usernames, setUsernames] = useState({});

    useEffect(() => {
        // Extract unique userIDs
        const uniqueUserIDs = [...new Set(data.map(post => post.userID))];
        
        const fetchUsernames = async () => {
            const usernamesCol = collection(db, 'usernames');
            const q = query(usernamesCol, where('userID', 'in', uniqueUserIDs));
            const snapshots = await getDocs(q);
            const userMap = {};
            snapshots.forEach(doc => {
                userMap[doc.data().userID] = doc.id;
            });
            setUsernames(userMap);
        };

        fetchUsernames();
    }, [data]);

    return (
        <div>
            {data.map((post, index) => (
                <div key={index} style={postStyle}>
                    <div><strong>Username:</strong> {usernames[post.userID]}</div>
                    <div><strong>Name:</strong> {post.name}</div>
                    <div><strong>Content:</strong> {post.content}</div>
                </div>
            ))}
        </div>
    );
}

export default Posts;
