const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

exports.getPosts = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    cors(req, res, async () => {
        try {
            const postsSnapshot = await db.collection('posts').get();
            const posts = [];
            postsSnapshot.forEach(doc => {
                posts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            res.status(200).send({ data: posts })
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).send('Internal server error.');
        }
    })
});

exports.createPost = functions.https.onCall((data, context) => {
    // Ensure the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated', 
            'The function must be called while authenticated.'
        );
    }

    const post = {
        content: data.content,
        name: data.name,
        userID: data.userID 
    };

    return admin.firestore().collection('posts').add(post);
});

exports.editPost = functions.https.onCall((data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  // Get data from the request
  const postId = data.postId;
  const newContent = data.newContent;
  const newName = data.newName;

  // Reference to the Firestore document
  const postRef = admin.firestore().collection('posts').doc(postId);

  // Update the document
  return postRef.update({
      content: newContent,
      name: newName
  })
  .then(() => {
      return { result: `Post with ID: ${postId} has been updated.` };
  })
  .catch((error) => {
      throw new functions.https.HttpsError('unknown', 'An error occurred while updating the post.', error);
  });
});
