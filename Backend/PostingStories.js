const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for multer

// Endpoint to post a story
router.post('/', upload.single('picture'), async (req, res) => {
  const { title, caption } = req.body;
  const userId = req.headers['user-id']; // Assume user ID is passed in headers after login

  if (!userId) {
    console.error('Missing user-id in request headers');
    return res.status(401).json({ message: 'Unauthorized: User ID is required' });
  }

  if (!title) {
    console.error('Missing title in request body');
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!req.file) {
    console.error('Missing picture in request body');
    return res.status(400).json({ message: 'Picture is required' });
  }

  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const currentTime = Date.now(); // Get the current timestamp in milliseconds

    const bucketFolder = path.join(__dirname, 'bucket', 'stories'); // Define the bucket folder
    const pictureExtension = path.extname(req.file.originalname); // Get the file extension
    const pictureId = `${currentTime}_${Math.random().toString(36).substring(2, 8)}`; // Generate unique picture ID
    const picturePath = path.join(bucketFolder, `${pictureId}${pictureExtension}`); // Include the extension

    console.log(`Saving picture to: ${picturePath}`);

    // Ensure the bucket folder exists
    if (!fs.existsSync(bucketFolder)) {
      fs.mkdirSync(bucketFolder, { recursive: true });
    }

    // Save the picture to the local bucket folder
    fs.writeFileSync(picturePath, req.file.buffer);

    // Save the story to Firestore under the user's document
    await admin.firestore().collection('users').doc(userId).collection('stories').add({
      title,
      caption,
      pictureId: `${pictureId}${pictureExtension}`, // Include the extension in the pictureId
      pictureUrl: `/bucket/stories/${pictureId}${pictureExtension}`, // Correctly set the local URL
      timestamp,
    });

    console.log('Story posted successfully');
    res.status(201).json({ message: 'Story posted successfully' });
  } catch (error) {
    console.error('Error posting story:', error);
    res.status(500).json({ message: 'Failed to post story', error: error.message });
  }
});

// Endpoint to fetch stories for the current user
router.get('/', async (req, res) => {
  const userId = req.headers['user-id']; // Assume user ID is passed in headers after login

  if (!userId) {
    console.error('Missing user-id in request headers');
    return res.status(401).json({ message: 'Unauthorized: User ID is required' });
  }

  try {
    console.log(`Fetching stories for user: ${userId}`);
    const userStoriesRef = admin.firestore().collection('users').doc(userId).collection('stories');
    const snapshot = await userStoriesRef.get();

    const stories = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const pictureUrl = data.pictureId.includes('.') 
        ? `/bucket/stories/${data.pictureId}` 
        : `/bucket/stories/${data.pictureId}.jpg`; // Default to .jpg if no extension
      console.log(`Story fetched: ${JSON.stringify(data)}`);
      stories.push({
        id: doc.id,
        title: data.title,
        caption: data.caption,
        pictureUrl, // Use the corrected pictureUrl
        timestamp: data.timestamp,
      });
    });

    res.status(200).json({ stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Failed to fetch stories', error: error.message });
  }
});

module.exports = router;
