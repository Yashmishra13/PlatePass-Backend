module.exports = (db) => async (req, res) => {
  const { plate } = req.body;

  if (!plate) {
    return res.status(400).json({ error: 'Missing plate' });
  }

  try {
    const doc = await db.collection('plates').doc(plate).get();

    if (!doc.exists) {
      return res.status(403).json({ error: 'Plate not authorized' });
    }

    const triggerRelay = require('../utils/TriggerRelay');
    await triggerRelay();

    await db.collection('logs').add({
      plate,
      access: 'Granted',
      source: 'camera',
      timestamp: new Date()
    });

    res.status(200).json({ message: 'Plate matched. Gate opened.' });
  } catch (err) {
    console.error('❌ Error in checkPlate:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
