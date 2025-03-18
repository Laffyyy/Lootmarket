const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Check if FIREBASE_CONFIG is being read correctly


// Parse Firebase configuration from environment variable
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: firebaseConfig.project_id,
    clientEmail: firebaseConfig.client_email,
    privateKey: firebaseConfig.private_key 
  }),
  databaseURL: firebaseConfig.databaseURL,
});

const db = admin.firestore();

// Endpoint to get user data
app.get('/users', async (req, res) => {
  try {
    const usersRef = db.collection('user');
    const snapshot = await usersRef.get();
    const users = [];

    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error getting users: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});