const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Generate password reset link using Firebase Admin
    const link = await admin.auth().generatePasswordResetLink(email);

    // Send the link via email
    await sendEmail(email, 'Password Reset', `Click here to reset your password: ${link}`);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error generating reset link:', err);
    return res.status(500).json({ success: false, message: 'Unable to generate reset link' });
  }
});

// Example sendEmail function (using nodemailer)
async function sendEmail(to, subject, text) {
  // Setup nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: 'your-email@gmail.com', // replace with your email
      pass: 'your-email-password',  // replace with your email password or app password
    },
  });

  await transporter.sendMail({
    from: '"PlatePass" <your-email@gmail.com>', // sender address
    to,
    subject,
    text,
  });
}

module.exports = router;