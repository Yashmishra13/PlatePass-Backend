module.exports = (db) => async (req, res) => {
  const user = req.body?.user || 'ManualTrigger';
  const reason = req.body?.reason || 'Manual override';

  try {
    await db.collection('logs').add({
      user,
      plate: null,
      access: 'Manual Granted',
      reason,
      source: 'app',
      timestamp: new Date()
    });

    const triggerRelay = require('../utils/TriggerRelay');
    await triggerRelay();

    res.status(200).json({ success: true, message: 'Gate manually opened.' });
  } catch (err) {
    console.error('❌ Error in openDoor:', err.message);
    res.status(500).json({ error: 'Failed to log manual override' });
  }
};
