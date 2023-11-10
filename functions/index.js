const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Firestore } = require('firebase-admin/firestore');
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

  exports.getComments = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    cors(req, res, async () => {
        try {
            const postId = req.query.postId; // Assuming the postId is passed as a query parameter
            const commentsSnapshot = await db.collection('comments')
                                            .where('postId', '==', postId)
                                            .get();
            const comments = [];
            commentsSnapshot.forEach(doc => {
                comments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            res.status(200).send({ data: comments });
        } catch (error) {
            console.error('Error fetching comments:', error);
            res.status(500).send('Internal server error.');
        }
    });
});

// Function to create a comment for a specific post
exports.createComment = functions.https.onCall((data, context) => {
    // Ensure the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated', 
            'The function must be called while authenticated.'
        );
    }

    const comment = {
        postId: data.postId,
        content: data.content,
        userID: context.auth.uid, // Use the UID from the authenticated user
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return db.collection('comments').add(comment);
});

// Function to edit a comment
exports.editComment = functions.https.onCall(async (data, context) => {
  // Check for authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { commentId, newContent } = data;
  const commentDoc = await db.collection('comments').doc(commentId).get();

  if (!commentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Comment not found.');
  }

  if (commentDoc.data().userID !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'User is not the owner of the comment.');
  }

  return db.collection('comments').doc(commentId).update({ content: newContent })
    .then(() => {
      return { status: 'success', message: 'Comment edited successfully' };
    })
    .catch(error => {
      throw new functions.https.HttpsError('unknown', error.message, error);
    });
});


// Function to delete a comment
exports.deleteComment = functions.https.onCall(async (data, context) => {
  // Check for authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { commentId } = data;
  const commentDoc = await db.collection('comments').doc(commentId).get();

  if (!commentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Comment not found.');
  }

  if (commentDoc.data().userID !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'User is not the owner of the comment.');
  }

  return db.collection('comments').doc(commentId).delete()
    .then(() => {
      return { status: 'success', message: 'Comment deleted successfully' };
    })
    .catch(error => {
      throw new functions.https.HttpsError('unknown', error.message, error);
    });
});
  

exports.createReply = functions.https.onCall((data, context) => {
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const reply = {
      content: data.content,
      commentId: data.commentId,
      postId: data.postId,
      userID: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  return db.collection('replies').add(reply);
});

exports.editReply = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { replyId, newContent } = data;
  const replyDoc = await db.collection('replies').doc(replyId).get();

  if (!replyDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reply not found.');
  }

  if (replyDoc.data().userID !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'User is not the owner of the reply.');
  }

  return db.collection('replies').doc(replyId).update({ content: newContent });
});

exports.deleteReply = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { replyId } = data;
  const replyDoc = await db.collection('replies').doc(replyId).get();

  if (!replyDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reply not found.');
  }

  if (replyDoc.data().userID !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'User is not the owner of the reply.');
  }

  return db.collection('replies').doc(replyId).delete();
});

exports.getReplies = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  cors(req, res, async () => {
      try {
          const commentId = req.query.commentId;
          const repliesSnapshot = await db.collection('replies')
                                         .where('commentId', '==', commentId)
                                         .get();
          const replies = [];
          repliesSnapshot.forEach(doc => {
              replies.push({ id: doc.id, ...doc.data() });
          });
          res.status(200).send({ data: replies });
      } catch (error) {
          console.error('Error fetching replies:', error);
          res.status(500).send('Internal server error.');
      }
  });
});

