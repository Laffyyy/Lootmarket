const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for multer

// Endpoint to post a story
router.post('/', upload.single('media'), async (req, res) => {
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
    const fileExtension = path.extname(req.file.originalname); // Get the file extension
    const fileId = `${currentTime}_${Math.random().toString(36).substring(2, 8)}`; // Generate unique file ID
    const bucketFolder = path.join(__dirname, 'bucket', 'stories'); // Define the bucket folder
    const filePath = path.join(bucketFolder, `${fileId}${fileExtension}`); // Include the extension

    console.log(`Saving file to: ${filePath}`);

    // Ensure the bucket folder exists
    if (!fs.existsSync(bucketFolder)) {
      fs.mkdirSync(bucketFolder, { recursive: true });
    }

    // Ensure the uploaded file is saved correctly
    const fileBuffer = req.file.buffer;
    fs.writeFileSync(filePath, fileBuffer);


    // Determine file type (image or video) based on extension
    const isVideo = ['.mp4', '.mov', '.avi'].includes(fileExtension.toLowerCase());
    const fileType = isVideo ? 'video' : 'image';

    // Save the story to Firestore under the user's document
    const storyData = {
      title,
      caption,
      fileId: `${fileId}${fileExtension}`, // Include the extension in the fileId
      fileUrl: `/bucket/stories/${fileId}${fileExtension}`, // Correctly set the local URL
      fileType, // Save the file type (image or video)
      timestamp,
    };

    await admin.firestore().collection('users').doc(userId).collection('stories').add(storyData);

    console.log('Story posted successfully:', storyData); // Log the story data for debugging
    res.status(201).json({ message: 'Story posted successfully' });
  } catch (error) {
    console.error('Error posting story:', error); // Log the error for debugging
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

    if (snapshot.empty) {
      console.warn(`No stories found for user: ${userId}`);
      return res.status(200).json({ stories: [] });
    }

    const stories = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.fileId) {
        console.warn(`Story with missing fileId: ${JSON.stringify(data)}`);
        return; // Skip stories with missing fileId
      }

      const fileUrl = data.fileId.includes('.') 
        ? `/bucket/stories/${data.fileId}` 
        : `/bucket/stories/${data.fileId}.jpg`; // Default to .jpg if no extension
      console.log(`Story fetched: ${JSON.stringify(data)}`);
      stories.push({
        id: doc.id,
        title: data.title,
        caption: data.caption,
        fileUrl, // Use the corrected fileUrl
        fileType: data.fileType,
        timestamp: data.timestamp,
      });
    });

    res.status(200).json({ stories });
  } catch (error) {
    console.error('Error fetching stories:', error.message, error.stack); // Log detailed error
    res.status(500).json({ message: 'Failed to fetch stories', error: error.message });
  }
});

// Endpoint to fetch all users' stories
router.get('/all', async (req, res) => {
  try {
    console.log("Fetching all users' stories");
    const usersCollection = admin.firestore().collection('users');
    const usersSnapshot = await usersCollection.get();

    if (usersSnapshot.empty) {
      console.warn('No users found');
      return res.status(200).json({ stories: [] });
    }

    const allStories = [];
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const storiesSnapshot = await usersCollection.doc(userId).collection('stories').get();

      storiesSnapshot.forEach((storyDoc) => {
        const data = storyDoc.data();
        if (!data.fileId) {
          console.warn(`Story with missing fileId: ${JSON.stringify(data)}`);
          return; // Skip stories with missing fileId
        }

        const fileUrl = data.fileId.includes('.')
          ? `/bucket/stories/${data.fileId}`
          : `/bucket/stories/${data.fileId}.jpg`; // Default to .jpg if no extension

        allStories.push({
          id: storyDoc.id,
          userId, // Include the user ID for reference
          title: data.title,
          caption: data.caption,
          fileUrl, // Use the corrected fileUrl
          fileType: data.fileType,
          timestamp: data.timestamp,
        });
      });
    }

    res.status(200).json({ stories: allStories });
  } catch (error) {
    console.error('Error fetching all users\' stories:', error.message, error.stack); // Log detailed error
    res.status(500).json({ message: 'Failed to fetch all users\' stories', error: error.message });
  }
});

module.exports = router;
