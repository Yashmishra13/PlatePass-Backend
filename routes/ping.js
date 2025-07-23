// routes/ping.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

module.exports = router;
