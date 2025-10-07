const express = require('express');
const router = express.Router();
const Profile = require('../../models/Licenses'); // not released for security
const logger = require('../utils/logger');

router.get('/verify/:key', async (req, res) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({ success: false, message: 'No license key provided' });
  }

  try {
    const profile = await Profile.findOne({
      'licenses.key': new RegExp(`^${key.trim()}$`, 'i')
    }).lean();

    if (!profile) {
      return res.status(404).json({ success: false, message: 'License key not found' });
    }

    const license = profile.licenses.find(
      l => l.key.toLowerCase() === key.trim().toLowerCase()
    );

    if (!license) {
      return res.status(404).json({ success: false, message: 'License key not found' });
    }

    res.json({
      success: true,
      license: {
        username: profile.username || 'N/A',
        discordUserId: profile.userId,
        verified: true,
        purchasedFrom: license.type || 'Standard',
        issuedAt: license.issuedAt
      }
    });

  } catch (err) {
    logger.errorLog('License verify error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
