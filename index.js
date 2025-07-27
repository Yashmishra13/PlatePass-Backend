// index.js
require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const forgotPasswordRoutes = require('./routes/forgot-password');


const app = express();
const PORT = process.env.PORT || 3000;

const serviceAccount = require('./firebase-key.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Allow cross-origin requests from Expo or other platforms
app.use(cors());

app.use(express.json({
  strict: false,
  inflate: true,
  limit: '1kb',
  type: ['application/json', 'text/plain'],
}));

// ✅ ROUTES
const checkPlate = require('./routes/checkPlate')(db);
const openDoor = require('./routes/openDoor')(db);
const pingRoute = require('./routes/ping');
const vehicleRoutes = require('./routes/vehicles')(db);
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use('/auth', forgotPasswordRoutes); // ✅ Now /auth/forgot-password will work


const contactRoute = require('./routes/contact');
app.use('/contact', contactRoute);

app.post('/checkPlate', checkPlate);

app.post('/openDoor', openDoor);
app.use('/ping', pingRoute);
app.use('/vehicles', vehicleRoutes);

// ✅ Uncomment below only if you have forgot-password.js
// const forgotPasswordRoutes = require('./routes/forgot-password');
// app.use('/', forgotPasswordRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
