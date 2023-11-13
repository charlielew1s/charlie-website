const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

const db = admin.firestore();

exports.getPosts = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    cors(req, res, async () => {
        try {
            const postsSnapshot = await db.collection('posts').get();
            const posts = postsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            res.status(200).send({ data: posts });
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).send('Internal server error.');
        }
    });
});

exports.createPost = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    cors(req, res, async () => {
        try {
            const { content, name, userID } = JSON.parse(req.body);
            const post = { content, name, userID };
            const result = await db.collection('posts').add(post);
            res.status(200).send({ id: result.id, ...post });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).send('Internal server error.');
        }
    });
});

// Apply similar changes to other functions like 'editPost', 'deletePost', 'getComments', etc.


exports.editPost = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  cors(req, res, async () => {
      if (!req.context.auth) {
          res.status(401).send('User must be authenticated.');
          return;
      }
      const { postId, name, content } = JSON.parse(req.body);
      db.collection('posts').doc(postId).update({ name, content })
          .then(() => {
              res.status(200).send({ status: 'success', message: 'Post updated successfully' });
          })
          .catch(error => {
              console.error('Error updating post:', error);
              res.status(500).send('Internal server error.');
          });
  });
});


exports.deletePost = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  cors(req, res, async () => {
      if (!req.context.auth) {
          res.status(401).send('User must be authenticated.');
          return;
      }
      const { postId } = JSON.parse(req.body);
      db.collection('posts').doc(postId).delete()
          .then(() => {
              res.status(200).send({ status: 'success', message: 'Post deleted successfully' });
          })
          .catch(error => {
              console.error('Error deleting post:', error);
              res.status(500).send('Internal server error.');
          });
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
exports.createComment = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  cors(req, res, async () => {
      try {
          const { postId, content } = JSON.parse(req.body);
          const userID = req.context.auth.uid; // Use the UID from the authenticated user

          const comment = {
              postId,
              content,
              userID,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
          };

          const result = await db.collection('comments').add(comment);
          res.status(200).send({ id: result.id, ...comment });
      } catch (error) {
          console.error('Error creating comment:', error);
          res.status(500).send('Internal server error.');
      }
  });
});


// Function to edit a comment
exports.editComment = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  cors(req, res, async () => {
      if (!req.context.auth) {
          res.status(401).send('User must be authenticated.');
          return;
      }

      const { commentId, newContent } = JSON.parse(req.body);
      const commentDoc = await db.collection('comments').doc(commentId).get();

      if (!commentDoc.exists) {
          res.status(404).send('Comment not found.');
          return;
      }

      if (commentDoc.data().userID !== req.context.auth.uid) {
          res.status(403).send('User is not the owner of the comment.');
          return;
      }

      db.collection('comments').doc(commentId).update({ content: newContent })
          .then(() => {
              res.status(200).send({ status: 'success', message: 'Comment edited successfully' });
          })
          .catch(error => {
              console.error('Error editing comment:', error);
              res.status(500).send('Internal server error.');
          });
  });
});



// Function to delete a comment
exports.deleteComment = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  cors(req, res, async () => {
      if (!req.context.auth) {
          res.status(401).send('User must be authenticated.');
          return;
      }

      const { commentId } = JSON.parse(req.body);
      const commentDoc = await db.collection('comments').doc(commentId).get();

      if (!commentDoc.exists) {
          res.status(404).send('Comment not found.');
          return;
      }

      if (commentDoc.data().userID !== req.context.auth.uid) {
          res.status(403).send('User is not the owner of the comment.');
          return;
      }

      db.collection('comments').doc(commentId).delete()
          .then(() => {
              res.status(200).send({ status: 'success', message: 'Comment deleted successfully' });
          })
          .catch(error => {
              console.error('Error deleting comment:', error);
              res.status(500).send('Internal server error.');
          });
  });
});

  

