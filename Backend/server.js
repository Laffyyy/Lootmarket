const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const authRoutes = require('./auth'); // Ensure auth.js exports a router instance
const loginRoutes = require('./login'); // Ensure login.js exports a router instance

dotenv.config(); // Ensure this loads the FIREBASE_API_KEY from the .env file

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from the frontend

// Parse Firebase configuration from environment variable
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: firebaseConfig.project_id,
    clientEmail: firebaseConfig.client_email,
    privateKey: firebaseConfig.private_key.replace(/\\n/g, '\n'),
  }),
  databaseURL: firebaseConfig.databaseURL,
});

const db = admin.firestore();

// Use auth routes
app.use('/auth', authRoutes);

// Use login routes
app.use('/login', loginRoutes);

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