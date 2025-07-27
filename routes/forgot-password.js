const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  console.log('[Forgot Password] Request received:', req.body);

  const { email } = req.body;
  if (!email) {
    console.log('[Forgot Password] No email provided');
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const actionCodeSettings = {
      url: 'https://platepass.app/reset-success',
      handleCodeInApp: false,
    };

    console.log('[Forgot Password] Generating password reset link for:', email);
    const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
    console.log('[Forgot Password] Password reset link generated:', link);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('[Forgot Password] Sending email to:', email);
    await transporter.sendMail({
      from: `PlatePass <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your PlatePass password',
      html: `<p>Click below to reset your password:</p><p><a href="${link}">${link}</a></p>`,
    });

    console.log('[Forgot Password] Reset email sent successfully');
    return res.status(200).json({ success: true, message: 'Reset email sent.' });
  } catch (err) {
    console.error('[Forgot Password] ERROR:', err);  // <-- log real error
    return res.status(500).json({
      success: false,
      message: err.message || 'Unknown error',
    });
  }
});

module.exports = router;
