module.exports = (db) => async (req, res) => {
  const user = req.body?.user || 'UnknownUser';
  const reason = req.body?.reason || 'Unknown reason';
  const time = new Date().toISOString();

  console.log(`🔔 [${time}] Request received at /openDoor`);
  console.log(`👤 User: ${user} | 📋 Reason: ${reason}`);

  try {
    // Log in Firestore/DB
    await db.collection('logs').add({
      user,
      plate: null,
      access: 'Manual Granted',
      reason,
      source: 'app',
      timestamp: new Date()
    });

    // Trigger the Shelly
    const triggerRelay = require('../utils/TriggerRelay');
    await triggerRelay();

    console.log(`✅ [${time}] Garage relay triggered successfully.`);
    res.status(200).json({ success: true, message: 'Gate manually opened.' });
  } catch (err) {
    console.error(`❌ [${time}] Error in openDoor:`, err.stack || err.message);
    res.status(500).json({ error: 'Failed to log or open garage' });
  }
};
