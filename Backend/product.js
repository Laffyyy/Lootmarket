const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for multer

// Serve static files from the bucket folder
router.use('/bucket', express.static(path.join(__dirname, 'bucket'))); // Ensure this serves the correct folder

// Endpoint to add a product under a specific user
router.post('/add', upload.single('image'), async (req, res) => {
  console.log('Request Body:', req.body); // Log the request body
  console.log('File:', req.file); // Log the uploaded file

  const { name, description, price } = req.body;
  const userId = req.headers['user-id']; // Assume user ID is passed in headers after login

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID is required' });
  }

  if (!name || !description || !price) {
    return res.status(400).json({ message: 'Name, description, and price are required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Product image is required' });
  }

  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const currentTime = Date.now(); // Get the current timestamp in milliseconds

    // Fetch the current count of products for the user
    const userProductsRef = admin.firestore().collection('users').doc(userId).collection('product');
    const snapshot = await userProductsRef.get();
    const count = snapshot.size; // Count the number of existing products

    const imageId = `${currentTime}_${count}`; // Generate image ID using timestamp and count
    const bucketFolder = path.join(__dirname, 'bucket', 'products'); // Path to the local bucket folder
    const imagePath = path.join(bucketFolder, `${imageId}${path.extname(req.file.originalname)}`);

    // Ensure the bucket folder exists
    if (!fs.existsSync(bucketFolder)) {
      fs.mkdirSync(bucketFolder, { recursive: true });
    }

    // Save the image to the local bucket folder
    fs.writeFileSync(imagePath, req.file.buffer);

    // Generate a URL for the uploaded image
    const pictureUrl = `/bucket/products/${imageId}${path.extname(req.file.originalname)}`; // Ensure correct URL

    // Save the product to Firestore under the user's document
    await userProductsRef.add({
      name,
      description,
      price: parseFloat(price), // Ensure price is stored as a number
      imageId,
      pictureUrl, // Add pictureUrl to the Firestore document
      timestamp,
    });

    res.status(201).json({ message: 'Product added successfully', pictureUrl });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
});

// Endpoint to fetch products for a specific user
router.get('/list', async (req, res) => {
  const userId = req.headers['user-id']; // Assume user ID is passed in headers after login

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID is required' });
  }

  try {
    const userProductsRef = admin.firestore().collection('users').doc(userId).collection('product');
    const snapshot = await userProductsRef.get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// Endpoint to fetch all products
router.get('/list-all', async (req, res) => {
  try {
    const productsRef = admin.firestore().collectionGroup('product'); // Use collectionGroup to fetch all products
    const snapshot = await productsRef.get();

    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        pictureUrl: `http://localhost:5000${data.pictureUrl}`, // Prepend base URL to pictureUrl
      };
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Failed to fetch all products', error: error.message });
  }
});

module.exports = router;
