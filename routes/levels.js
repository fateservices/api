const express = require('express');
const router = express.Router();
const Level = require('../../models/Level'); // not released for security

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await Level.findOne({ userId: id });
    if (!doc) return res.status(404).json({ error: "User not found" });

    res.json({
      userId: id,
      level: doc.level,
      xp: doc.xp
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
