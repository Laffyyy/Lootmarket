const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const admin = require('firebase-admin'); // Import Firebase Admin SDK

const router = express.Router();
const client = new OAuth2Client('176878939053-tb4n8t6390jrhvks67pkhoek9usn4pu7.apps.googleusercontent.com'); // Replace with your Web Client ID

router.get('/', async (req, res) => { // Ensure the route matches the frontend request
  const idToken = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  if (!idToken) {
    return res.status(400).json({ message: 'No ID token provided' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: '176878939053-tb4n8t6390jrhvks67pkhoek9usn4pu7.apps.googleusercontent.com', // Replace with your Web Client ID
    });
    const payload = ticket.getPayload();

    // Extract user information from the Google ID token
    const { email, name, picture, sub: uid } = payload;

    // Add or update the user in Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email).catch(async (error) => {
      if (error.code === 'auth/user-not-found') {
        // Create a new user if not found
        const newUser = await admin.auth().createUser({
          uid,
          email,
          displayName: name,
          photoURL: picture,
        });

        // Link the user to the Google provider
        await admin.auth().updateUser(newUser.uid, {
          providerData: [
            {
              providerId: 'google.com',
              uid: uid,
              displayName: name,
              email: email,
              photoURL: picture,
            },
          ],
        });

        return newUser;
      }
      throw error; // Re-throw other errors
    });

    // Save the user's email to the 'users' collection in Firestore if it doesn't already exist
    const userQuery = await admin.firestore().collection('users').where('email', '==', email).get();
    if (userQuery.empty) {
      // Save the user's email to the 'users' collection in Firestore with the document ID matching the user ID
      await admin.firestore().collection('users').doc(userRecord.uid).set({ email });
      console.log('Email added to users collection with UID as document ID:', email);
    } else {
      console.log('Email already exists in users collection:', email);
    }

    // Respond with the user information
    res.status(200).json({
      message: 'Google sign-in successful',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        picture: userRecord.photoURL,
        provider: 'google.com', // Explicitly indicate the provider
      },
    });
  } catch (error) {
    console.error('Error verifying Google ID token or updating Firebase user:', error);
    res.status(401).json({ message: 'Invalid token provided or user creation failed' });
  }
});

module.exports = router;
