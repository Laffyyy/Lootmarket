const express = require('express');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

// Endpoint to request OTP for password reset
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to Firestore with a timestamp
    await admin.firestore().collection('passwordResetOtps').doc(email).set({
      otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send OTP to user's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
      html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to email.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
  }
});

// Endpoint to reset password using OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }

    // Retrieve OTP from Firestore
    const otpDoc = await admin.firestore().collection('passwordResetOtps').doc(email).get();

    if (otpDoc.exists) {
      const otpData = otpDoc.data();

      if (!otpData.createdAt) {
        return res.status(400).json({ error: 'Invalid OTP data. Please request a new OTP.' });
      }

      const currentTime = new Date().getTime();
      const otpTime = otpData.createdAt.toDate().getTime();

      // Validate OTP
      if (otpData.otp === otp && (currentTime - otpTime) <= 10 * 60 * 1000) {
        try {
          // Update user's password
          const user = await admin.auth().getUserByEmail(email);
          await admin.auth().updateUser(user.uid, { password: newPassword });

          // Delete OTP document
          await otpDoc.ref.delete();

          res.status(200).json({ message: 'Password reset successfully.' });
        } catch (updateError) {
          console.error('Error updating user password:', updateError);
          res.status(500).json({ error: 'Failed to update password. Please try again later.' });
        }
      } else {
        res.status(400).json({ error: 'Invalid or expired OTP.' });
      }
    } else {
      res.status(400).json({ error: 'OTP not found. Please request a new OTP.' });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

module.exports = router;
