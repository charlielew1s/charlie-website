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

exports.deletePostByAttributes = functions.https.onCall(async (data, context) => {
    const { name, content, userID } = data;
  
    const db = admin.firestore();
    const postsRef = db.collection('posts');
  
    try {
      const snapshot = await postsRef.where('name', '==', name)
                                     .where('content', '==', content)
                                     .where('userID', '==', userID)
                                     .get();
  
      if (snapshot.empty) {
        return { success: false, message: 'No matching post found' };
      }
  
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
  
      return { success: true, message: 'Post deleted successfully' };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Failed to delete post', error);
    }
  });

  exports.editPostByAttributes = functions.https.onCall(async (data, context) => {
  const { oldName, oldContent, newName, newContent, userID } = data;

  const db = admin.firestore();
  const postsRef = db.collection('posts');

  try {
    const snapshot = await postsRef.where('name', '==', oldName)
                                   .where('content', '==', oldContent)
                                   .where('userID', '==', userID)
                                   .limit(1) // Assuming unique posts, only take the first match.
                                   .get();

    if (snapshot.empty) {
      return { success: false, message: 'No matching post found' };
    }

    const postDoc = snapshot.docs[0];
    await postDoc.ref.update({
      name: newName,
      content: newContent
    });

    return { success: true, message: 'Post updated successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to edit post', error);
  }
});

exports.editPostByAttributes = functions.https.onCall(async (data, context) => {
    const { oldName, oldContent, newName, newContent, userID } = data;
  
    const db = admin.firestore();
    const postsRef = db.collection('posts');
  
    try {
      const snapshot = await postsRef.where('name', '==', oldName)
                                     .where('content', '==', oldContent)
                                     .where('userID', '==', userID)
                                     .limit(1) // Assuming unique posts, only take the first match.
                                     .get();
  
      if (snapshot.empty) {
        return { success: false, message: 'No matching post found' };
      }
  
      const postDoc = snapshot.docs[0];
      await postDoc.ref.update({
        name: newName,
        content: newContent
      });
  
      return { success: true, message: 'Post updated successfully' };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Failed to edit post', error);
    }
  });

  exports.setUsername = functions.https.onCall(async (data, context) => {
    const { desiredUsername } = data;
    const userID = context.auth.uid;
  
    const db = admin.firestore();
    const usernamesRef = db.collection('usernames');
  
    // Check if desired username is already taken
    const snapshot = await usernamesRef.where('username', '==', desiredUsername).get();
    if (!snapshot.empty && snapshot.docs[0].id !== userID) {
        throw new functions.https.HttpsError('already-exists', 'This username is already taken.');
    }
    
    // Check if this user already has a username
    const userDoc = await usernamesRef.doc(userID).get();
    if (userDoc.exists) {
        // If yes, delete the old username
        const oldUsername = userDoc.data().username;
        if (oldUsername !== desiredUsername) {
            // Only update if the old username is different from the desired one
            await usernamesRef.doc(userID).update({ username: desiredUsername });
        }
    } else {
        // If not, simply add the new username
        await usernamesRef.doc(userID).set({ username: desiredUsername });
    }

    return { success: true, message: 'Username set successfully' };
});
