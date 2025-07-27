const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!message || !email) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    const ref = await admin.firestore().collection('contactMessages').add({
      name: name || 'Anonymous',
      email,
      message,
      submittedAt: admin.firestore.Timestamp.now(),
    });

    return res.status(200).json({ success: true, id: ref.id });
  } catch (err) {
    console.error('❌ Error saving contact message:', err);
    return res.status(500).json({ success: false, message: 'Failed to save message.' });
  }
});

module.exports = router;
