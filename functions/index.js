const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

exports.getPosts = functions.https.onRequest(async (req, res) => {
    try {
        const postsSnapshot = await db.collection('post').get();
        const posts = [];
        postsSnapshot.forEach(doc => {
            posts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).send(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Internal server error.');
    }
});



