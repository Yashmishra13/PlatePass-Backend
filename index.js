require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.use(cors());
app.use(express.json({
  strict: false,
  inflate: true,
  limit: '1kb',
  type: ['application/json', 'text/plain']
}));

const checkPlate = require('./routes/checkPlate')(db);
const openDoor = require('./routes/openDoor')(db);

app.post('/checkPlate', checkPlate);
app.post('/openDoor', openDoor);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
