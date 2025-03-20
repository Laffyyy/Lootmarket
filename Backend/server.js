const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const authRoutes = require('./auth'); // Ensure auth.js exports a router instance
const loginRoutes = require('./login'); // Ensure login.js exports a router instance
const googleSigninRoutes = require('./google-signin'); // Import Google Sign-In routes

dotenv.config(); // Ensure this loads the FIREBASE_API_KEY from the .env file

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors({ 
  origin: ['http://localhost:3000'], // Add your frontend's origin here
  methods: ['GET', 'POST'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
})); // Allow requests from the frontend

// Parse Firebase configuration from environment variable
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG); // Ensure this matches the correct Firebase project

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.project_id,
        clientEmail: firebaseConfig.client_email,
        privateKey: firebaseConfig.private_key.replace(/\\n/g, '\n'), // Replace escaped \n with actual newlines
      }),
      databaseURL: firebaseConfig.databaseURL,
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1); // Exit the process if Firebase initialization fails
  }
}

const db = admin.firestore();

// Use auth routes
app.use('/auth', authRoutes);

// Use login routes
app.use('/login', loginRoutes);

// Add Google Sign-In route
app.use('/google-signin', googleSigninRoutes);

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