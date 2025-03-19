const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios'); // Import axios for Firebase Authentication REST API
const nodemailer = require('nodemailer'); // Import Nodemailer
const dotenv = require('dotenv'); // Import dotenv for environment variables
const router = express.Router();

dotenv.config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Correct host for Gmail SMTP
  auth: {
    user: process.env.EMAIL_USER || '', // Your email address
    pass: process.env.EMAIL_PASS || '', // Your email password
  },
});

// Login endpoint using Firebase Admin and Firebase Authentication REST API
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Use Firebase Authentication REST API to verify email and password
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });

    const { idToken, localId } = response.data;

    // Check if the user exists in the 'users' collection by querying the email field
    const userQuery = await admin.firestore().collection('users').where('email', '==', email).get();

    if (userQuery.empty) {
      // If the user is not in the 'users' collection, resend OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP to Firestore with a timestamp
      await admin.firestore().collection('otps').doc(localId).set({
        email: email,
        otp: otp,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send OTP to user's email using Nodemailer
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
      };

      await transporter.sendMail(mailOptions);

      res.status(403).json({ message: 'Email not verified. OTP has been resent to your email.' });
      return;
    }

    // Optionally, fetch additional user details using Firebase Admin
    const userRecord = await admin.auth().getUser(localId);

    res.status(200).json({ message: 'Login successful', token: idToken, user: userRecord });
  } catch (error) {
    console.error('Error during login:', {
      message: error.message,
      response: error.response?.data,
    });

    res.status(401).json({
      message: 'Invalid email or password',
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

module.exports = router;
