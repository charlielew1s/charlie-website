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
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const userId = context.auth.uid;
  // Fetch the username from your users collection based on userId
  return admin.firestore().collection('users').doc(userId).get()
    .then(doc => {
      if (!doc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found.');
      }
      const username = doc.data().username;
      const post = {
        content: data.content,
        name: data.name,
        userID: userId,
        username: username, // Include the username here
        votes: 0 // Initialize votes to 0
      };

      return admin.firestore().collection('posts').add(post);
    });
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
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const userId = context.auth.uid;
  // Fetch the username
  return admin.firestore().collection('users').doc(userId).get()
    .then(doc => {
      if (!doc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found.');
      }
      const username = doc.data().username;
      const comment = {
        postId: data.postId,
        content: data.content,
        userID: userId,
        username: username, // Include the username
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        votes: 0 // Initialize votes to 0
      };

      return db.collection('comments').add(comment);
    });
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
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;
  // Fetch the username
  return admin.firestore().collection('users').doc(userId).get()
    .then(doc => {
      if (!doc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found.');
      }
      const username = doc.data().username;
      const reply = {
        content: data.content,
        commentId: data.commentId,
        userId: userId,
        username: username, // Include the username
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        votes: 0 // Initialize votes to 0
      };

      return db.collection('replies').add(reply);
    });
});



exports.getReplies = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  cors(req, res, async () => {
      try {
          const commentId = req.query.commentId; // Assuming the commentId is passed as a query parameter
          const repliesSnapshot = await db.collection('replies')
                                          .where('commentId', '==', commentId)
                                          .orderBy('createdAt')
                                          .get();
          const replies = [];
          repliesSnapshot.forEach(doc => {
              replies.push({
                  id: doc.id,
                  ...doc.data()
              });
          });
          res.status(200).send({ data: replies });
      } catch (error) {
          console.error('Error fetching replies:', error);
          res.status(500).send('Internal server error.');
      }
  });
});

exports.editReply = functions.https.onCall((data, context) => {
  // Check for authentication
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { replyId, newContent } = data;

  const replyRef = db.collection('replies').doc(replyId);
  return replyRef.get().then(doc => {
      if (!doc.exists) {
          throw new functions.https.HttpsError('not-found', 'Reply not found.');
      }
      if (doc.data().userId !== context.auth.uid) {
          throw new functions.https.HttpsError('permission-denied', 'User is not the owner of the reply.');
      }
      return replyRef.update({ content: newContent });
  })
  .then(() => ({ status: 'success', message: 'Reply updated successfully' }))
  .catch(error => {
      throw new functions.https.HttpsError('unknown', error.message, error);
  });
});

exports.deleteReply = functions.https.onCall((data, context) => {
  // Check for authentication
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { replyId } = data;

  const replyRef = db.collection('replies').doc(replyId);
  return replyRef.get().then(doc => {
      if (!doc.exists) {
          throw new functions.https.HttpsError('not-found', 'Reply not found.');
      }
      if (doc.data().userId !== context.auth.uid) {
          throw new functions.https.HttpsError('permission-denied', 'User is not the owner of the reply.');
      }
      return replyRef.delete();
  })
  .then(() => ({ status: 'success', message: 'Reply deleted successfully' }))
  .catch(error => {
      throw new functions.https.HttpsError('unknown', error.message, error);
  });
});

exports.getPostsByUser = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to get posts.');
  }

  const userId = data.userId;
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with one argument "userId".');
  }

  try {
    const postsSnapshot = await db.collection('posts')
                                  .where('userID', '==', userId)
                                  .get();

    const posts = [];
    postsSnapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { status: 'success', posts };
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw new functions.https.HttpsError('unknown', 'Failed to fetch user posts', error);
  }
});

exports.followUser = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userIdToFollow = data.userId;
  const currentUserId = context.auth.uid;

  return admin.firestore().collection('users').doc(currentUserId).update({
    following: admin.firestore.FieldValue.arrayUnion(userIdToFollow)
  });
});

exports.unfollowUser = functions.https.onCall((data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userIdToUnfollow = data.userId;
  const currentUserId = context.auth.uid;

  // Remove the userId from the 'following' array
  return admin.firestore().collection('users').doc(currentUserId).update({
    following: admin.firestore.FieldValue.arrayRemove(userIdToUnfollow)
  });
});

exports.getPersonalizedFeed = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const currentUserId = context.auth.uid;

  try {
    // Fetch the current user's following list
    const userDoc = await admin.firestore().collection('users').doc(currentUserId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found.');
    }

    const following = userDoc.data().following || [];
    
    // Query for posts from followed users
    const posts = [];
    for (const userId of following) {
      const postsSnapshot = await admin.firestore().collection('posts').where('userID', '==', userId).get();
      postsSnapshot.forEach(doc => {
        posts.push({ id: doc.id, ...doc.data() });
      });
    }

    return { posts };
  } catch (error) {
    console.error('Error getting personalized feed:', error);
    throw new functions.https.HttpsError('unknown', error.message, error);
  }
});

exports.createUserDocument = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection('users').doc(user.uid).set({
    username: '', // You might want to get the username differently, or prompt the user to set it later
    following: []
  });
});


// Function to upvote a post, comment, or reply
exports.upvote = functions.https.onCall((data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { documentId, collection } = data; // 'collection' could be 'posts', 'comments', or 'replies'
  const documentRef = db.collection(collection).doc(documentId);

  return documentRef.update({
    votes: admin.firestore.FieldValue.increment(1)
  });
});

// Function to downvote a post, comment, or reply
exports.downvote = functions.https.onCall((data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { documentId, collection } = data; // 'collection' could be 'posts', 'comments', or 'replies'
  const documentRef = db.collection(collection).doc(documentId);

  return documentRef.update({
    votes: admin.firestore.FieldValue.increment(-1)
  });
});
