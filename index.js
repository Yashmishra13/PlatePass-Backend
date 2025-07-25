// index.js
require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const serviceAccount = require('./firebase-key.json');

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

// Routes
const checkPlate = require('./routes/checkPlate')(db);
const openDoor = require('./routes/openDoor')(db);
const pingRoute = require('./routes/ping');
const vehicleRoutes = require('./routes/vehicles')(db);
const authRoutes = require('./routes/auth'); // Add your auth routes
const forgotPasswordRoutes = require('./routes/forgot-password'); // Add forgot-password route

app.post('/checkPlate', checkPlate);
app.post('/openDoor', openDoor);
app.use('/ping', pingRoute);
app.use('/vehicles', vehicleRoutes);
app.use('/auth', authRoutes); // Mount auth routes
app.use('/auth', forgotPasswordRoutes); // Mount forgot-password route

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
