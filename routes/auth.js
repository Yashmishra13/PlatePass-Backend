const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust path as needed

// POST /auth/signup
router.post('/signup', async (req, res) => {
  console.log('[Signup] Incoming body:', req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[Signup] Missing fields');
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[Signup] Email exists:', email);
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    console.log('[Signup] User created:', user._id);
    res.status(201).json({ success: true, uid: user._id });
  } catch (err) {
    console.error('[Signup] Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
