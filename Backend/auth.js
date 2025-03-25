const express = require('express');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
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

// Endpoint to register user and send email OTP
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials are not set. Please configure EMAIL_USER and EMAIL_PASS in your environment variables.');
    }

    // Create user with email and password
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Generate OTP 
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to Firestore with a timestamp
    await admin.firestore().collection('otps').doc(userRecord.uid).set({
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

    res.status(201).json({ message: 'User registered successfully. OTP sent to email.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user: ' + error.message);
  }
});

// Endpoint to resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Log the incoming request for debugging
    console.log('Resending OTP for email:', email);

    // Generate a new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update the OTP in Firestore with a new timestamp
    const otpQuery = await admin.firestore().collection('otps').where('email', '==', email).get();

    if (!otpQuery.empty) {
      const otpDoc = otpQuery.docs[0];
      await otpDoc.ref.update({
        otp: newOtp,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send the new OTP to the user's email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your New OTP Code',
        text: `Your new OTP code is ${newOtp}. It is valid for 10 minutes.`,
        html: `<p>Your new OTP code is <strong>${newOtp}</strong>. It is valid for 10 minutes.</p>`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'New OTP sent to email.' });
    } else {
      console.warn('No OTP document found for email:', email);
      res.status(400).json({ error: 'Email not found. Please register first.' });
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).send('Error resending OTP: ' + error.message);
  }
});

// Endpoint to verify email OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Log the incoming request for debugging
    console.log('Verifying OTP for email:', email, 'with OTP:', otp);

    // Validate input
    if (!email || !otp) {
      console.error('Missing email or OTP in request body');
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Retrieve the most recent OTP from Firestore
    const otpQuery = await admin.firestore()
      .collection('otps')
      .where('email', '==', email)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!otpQuery.empty) {
      const otpDoc = otpQuery.docs[0];
      const otpData = otpDoc.data();

      // Log the retrieved OTP data for debugging
      console.log('Retrieved OTP data:', otpData);

      // Check if the OTP matches and is within the valid time frame (e.g., 10 minutes)
      const currentTime = new Date().getTime();
      const otpTime = otpData.createdAt.toDate().getTime();
      const isValidOtp = otpData.otp === otp && (currentTime - otpTime) <= 10 * 60 * 1000;

      if (isValidOtp) {
        // Save the user's email to the 'users' collection in Firestore
        await admin.firestore().collection('users').doc(otpDoc.id).set({ email });

        res.status(200).json({ message: 'Email verified successfully' });
      } else {
        const errorDetails = {
          reason: otpData.otp !== otp ? 'OTP mismatch' : 'OTP expired',
          providedOtp: otp,
          storedOtp: otpData.otp,
          timeDifference: currentTime - otpTime,
        };
        console.warn('Invalid or expired OTP:', errorDetails);
        res.status(400).json({ error: 'Invalid or expired OTP', details: errorDetails });
      }
    } else {
      console.warn('No OTP document found for email:', email);
      res.status(400).json({ error: 'Invalid email or OTP', details: { email } });
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Error verifying email:', error);

    // Add detailed error response
    res.status(500).json({ error: 'Error verifying email', details: error.message });
  }
});

module.exports = router;