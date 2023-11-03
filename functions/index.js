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
    // Check for authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
  
    const { postId, name, content } = data;
    return admin.firestore().collection('posts').doc(postId).update({ name, content })
      .then(() => {
        return { status: 'success', message: 'Post updated successfully' };
      })
      .catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error);
      });
  });

  exports.deletePost = functions.https.onCall((data, context) => {
    // Check for authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
  
    const { postId } = data;
    return admin.firestore().collection('posts').doc(postId).delete()
      .then(() => {
        return { status: 'success', message: 'Post deleted successfully' };
      })
      .catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error);
      });
  });

  exports.addComment = functions.https.onCall((data, context) => {
    // Check for authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { postId, content } = data;
    const commentData = {
        content: content,
        userID: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return admin.firestore().collection('posts').doc(postId).collection('comments').add(commentData)
        .then(commentRef => {
            return { status: 'success', message: 'Comment added successfully', commentId: commentRef.id };
        })
        .catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error);
        });
});

exports.editComment = functions.https.onCall((data, context) => {
  // Check for authentication
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { postId, commentId, newContent } = data;
  const commentRef = admin.firestore().collection('posts').doc(postId).collection('comments').doc(commentId);

  return commentRef.get()
      .then(doc => {
          if (!doc.exists) {
              throw new functions.https.HttpsError('not-found', 'Comment not found.');
          }
          if (doc.data().userID !== context.auth.uid) {
              throw new functions.https.HttpsError('permission-denied', 'User can only edit their own comments.');
          }
          return commentRef.update({ content: newContent });
      })
      .then(() => {
          return { status: 'success', message: 'Comment edited successfully' };
      })
      .catch(error => {
          throw new functions.https.HttpsError('unknown', error.message, error);
      });
});

exports.deleteComment = functions.https.onCall((data, context) => {
  // Check for authentication
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { postId, commentId } = data;
  const commentRef = admin.firestore().collection('posts').doc(postId).collection('comments').doc(commentId);

  return commentRef.get()
      .then(doc => {
          if (!doc.exists) {
              throw new functions.https.HttpsError('not-found', 'Comment not found.');
          }
          if (doc.data().userID !== context.auth.uid) {
              throw new functions.https.HttpsError('permission-denied', 'User can only delete their own comments.');
          }
          return commentRef.delete();
      })
      .then(() => {
          return { status: 'success', message: 'Comment deleted successfully' };
      })
      .catch(error => {
          throw new functions.https.HttpsError('unknown', error.message, error);
      });
});
