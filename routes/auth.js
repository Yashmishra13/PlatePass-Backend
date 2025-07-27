console.log('✅ auth.js loaded');

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const fetch = require('node-fetch');
const verifyToken = require('../middlewares/verifyToken');

const db = admin.firestore();

// POST /auth/login
router.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Invalid input.' });
    }

    try {
      const firebaseRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );

      const data = await firebaseRes.json();
      if (data.error) {
        return res.status(401).json({ success: false, message: data.error.message });
      }

      const userRecord = await admin.auth().getUser(data.localId);
      if (!userRecord.emailVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email.' });
      }

      let name = '';
      try {
        const userDoc = await db.collection('users').doc(data.localId).get();
        if (userDoc.exists) {
          name = userDoc.data().name || '';
        }
      } catch (err) {
        console.error('Error fetching user name:', err);
      }

      return res.status(200).json({
        success: true,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        uid: data.localId,
        email: data.email,
        name: name,
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Login failed.' });
    }
  }
);

// PATCH /auth/user/:uid
router.patch('/user/:uid', async (req, res) => {
  const { uid } = req.params;
  const { name, phone, email } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  try {
    const userRef = admin.firestore().collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await userRef.update({ name, phone: phone || '', email });
    return res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /auth/user/:uid
router.delete('/user/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    await admin.auth().deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    return res.status(200).json({ success: true, message: 'User deleted from Auth and Firestore.' });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

// POST /auth/signup
router.post(
  '/signup',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').isString().notEmpty(),
    body('phone').optional().isMobilePhone('any'),
  ],
  async (req, res) => {
    const userData = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Invalid input.' });
    }

    try {
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
      });

      const { password, ...firestoreData } = userData;
      firestoreData.createdAt = admin.firestore.FieldValue.serverTimestamp();

      await db.collection('users').doc(userRecord.uid).set(firestoreData);

      const link = await admin.auth().generateEmailVerificationLink(userData.email);
      const transporter = require('nodemailer').createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `PlatePass <${process.env.EMAIL_USER}>`,
        to: userData.email,
        subject: 'Verify your PlatePass Email',
        html: `<p>Thanks for signing up! Please verify your email by clicking the link below:</p><p><a href="${link}">${link}</a></p>`,
      });

      return res.status(201).json({ success: true, uid: userRecord.uid, ...firestoreData });
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ success: false, message: 'Signup failed.' });
    }
  }
);

// GET /auth/user/:uid
router.get('/user/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, ...userDoc.data() });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /auth/change-password
router.post('/change-password', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    await admin.auth().updateUser(uid, { password: newPassword });

    return res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

module.exports = router;
