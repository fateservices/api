const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: "ok",
    endpoints: {
      bot: "/api/bot",
      stats: "/api/stats",
      ping: "/api/ping"
    }
  });
});

router.get('/bot', (req, res) => {
  res.json({
    name: "FateBot",
    description: "AI-powered social Discord bot",
    version: "2.0.0"
  });
});

router.get('/stats', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version
  });
});

router.get('/ping', (req, res) => {
  res.json({ 
    online: true
  });
});

module.exports = router;
