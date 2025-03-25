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
    return res.status(401).json({ message: 'Unauthorized: User ID is required' });
  }

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Picture is required' });
  }

  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const currentTime = Date.now(); // Get the current timestamp in milliseconds

    // Fetch the current count of stories for the user
    const userStoriesRef = admin.firestore().collection('users').doc(userId).collection('stories');
    const snapshot = await userStoriesRef.get();
    const count = snapshot.size; // Count the number of existing stories

    const pictureId = `${currentTime}_${count}`; // Generate picture ID using timestamp and count
    const bucketFolder = path.join(__dirname, 'bucket', 'stories'); // Path to the local bucket folder
    const picturePath = path.join(bucketFolder, `${pictureId}${path.extname(req.file.originalname)}`);

    // Ensure the bucket folder exists
    if (!fs.existsSync(bucketFolder)) {
      fs.mkdirSync(bucketFolder, { recursive: true });
    }

    // Save the picture to the local bucket folder
    fs.writeFileSync(picturePath, req.file.buffer);

    // Save the story to Firestore under the user's document
    await userStoriesRef.add({
      title,
      caption,
      pictureId: pictureId || "",
      timestamp,
    });

    res.status(201).json({ message: 'Story posted successfully' });
  } catch (error) {
    console.error('Error posting story:', error);
    res.status(500).json({ message: 'Failed to post story', error: error.message });
  }
});

module.exports = router;
