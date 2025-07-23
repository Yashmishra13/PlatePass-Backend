// server/routes/vehicles.js
const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  // Add new vehicle
  router.post('/', async (req, res) => {
    try {
      const { make, model, year, color, plate, user } = req.body;

      console.log('POST /vehicles body:', req.body);

      if (!make || !model || !year || !color || !plate || !user) {
        console.warn('Missing fields:', { make, model, year, color, plate, user });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const vehicle = {
        make,
        model,
        year,
        color,
        plate,
        user,
        status: 'pending',
        createdAt: new Date(),
      };

      const docRef = await db.collection('vehicles').add(vehicle);
      console.log('Vehicle added with ID:', docRef.id);

      return res.status(200).json({ success: true, id: docRef.id });
    } catch (err) {
      console.error('Error adding vehicle:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all vehicles by user
  router.get('/:email', async (req, res) => {
    try {
      console.log('GET /vehicles/:email for', req.params.email);

      const snapshot = await db.collection('vehicles')
        .where('user', '==', req.params.email)
        .orderBy('createdAt', 'desc')
        .get();

      const vehicles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`Fetched ${vehicles.length} vehicles`);

      return res.status(200).json(vehicles);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete vehicle by ID
  router.delete('/:id', async (req, res) => {
    try {
      console.log('DELETE /vehicles/:id for', req.params.id);

      await db.collection('vehicles').doc(req.params.id).delete();
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
