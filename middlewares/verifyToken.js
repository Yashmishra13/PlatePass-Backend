// middlewares/verifyToken.js
const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
