const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const authRoutes = require('./auth'); // Ensure auth.js exports a router instance
const loginRoutes = require('./login'); // Ensure login.js exports a router instance
const googleSigninRoutes = require('./google-signin'); // Ensure this is correctly imported
const postingStoriesRoutes = require('./PostingStories'); // Import the new route
const path = require('path'); // Import path module
const productRoutes = require('./product'); // Import the product route
const path = require('path'); // Import path module
const forgotpass = require('./forgotpass'); // Ensure this is correctly imported

dotenv.config(); // Ensure this loads the FIREBASE_API_KEY from the .env file

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors({ 
  origin: ['http://localhost:3000'], // Add your frontend's origin here
  methods: ['GET', 'POST'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id'], // Add 'user-id' to allowed headers
})); // Allow requests from the frontend

// Serve static files from the bucket directory
app.use('/bucket', express.static(path.join(__dirname, 'bucket')));

// Serve static files from the bucket/stories directory
app.use('/bucket/stories', express.static(path.join(__dirname, 'bucket', 'stories')));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'Frontend', 'lootmarketfront', 'public')));

// Log requests to static files for debugging directory
app.use('/bucket/stories', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allow GET and OPTIONS methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
  console.log(`Static file requested: ${req.path}`);
  next();
});

// Set CORS and access control headers for all requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups'); // Add Cross-Origin-Opener-Policy header
  next();
});

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
app.use('/google-signin', googleSigninRoutes); // Ensure this is correctly registered

// Use posting stories routes
app.use('/stories', postingStoriesRoutes); // Register the route

// Use product routes
app.use('/product', productRoutes); // Register the product route

// Serve static files from the bucket folder
app.use('/bucket', express.static(path.join(__dirname, 'bucket'))); // Ensure this serves the correct folder

app.use('/forgotpass', forgotpass); // Ensure this is correctly imported

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