const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserProfile = require('../models/UserProfile');
const router = express.Router();
require('dotenv').config();

// GET /auth/discord - Get Discord OAuth URL
router.get('/discord', (req, res) => {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
  res.json({ url: discordAuthUrl });
});

// GET /auth/discord/callback - Handle OAuth callback
router.get('/discord/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Missing "code" query parameter');
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(400).json({ message: 'Failed to get access token', error: tokenData });
    }

    // Fetch user info from Discord
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userRes.json();

    if (!discordUser.id) {
      return res.status(400).json({ message: 'Invalid user data', error: discordUser });
    }

    // Check or create user
    let user = await UserProfile.findOne({ userId: discordUser.id });

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    if (!user) {
      user = new UserProfile({
        userId: discordUser.id,
        uuid: uuidv4(),
        name: discordUser.username,
        avatar: avatarUrl,
      });
      await user.save();
    } else if (user.avatar !== avatarUrl) {
      user.avatar = avatarUrl;
      await user.save();
    }

    // Create JWT
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Redirect with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/discord/success?token=${token}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Discord auth error:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
});

module.exports = router;
