require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const Profile = require('../models/Profile'); // Not released for security
const logger = require('./utils/logger');
// Moderation imports not released for security

// Moderation code would be here but it's not released for security

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const createSession = () => {
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ client: mongoose.connection.getClient() }),
  });
};

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    createSession()(req, res, next);
  } else {
    console.warn('Mongo not connected yet, delaying session setup...');
    setTimeout(() => app.use(createSession()), 1000);
    next();
  }
});

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => {
  done(null, user);
});

const guildId = process.env.DISCORD_GUILD_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ["identify", "email", "guilds.join"]
}, async (accessToken, refreshToken, discordUser, done) => {
  try {
    let profile = await Profile.findOne({ userId: discordUser.id });
    if (!profile) {
      profile = await Profile.create({
        userId: discordUser.id,
        username: discordUser.username,
        email: discordUser.email
      });
    }

    try {
      await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUser.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: accessToken
        })
      });
      logger.info(`Added ${discordUser.username} to the server`);
    } catch (err) {
      logger.errorLog("Failed to add ${discordUser.username} (user) to Discord server:", err);
    }

    done(null, {
      id: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar,
      email: discordUser.email,
      profile
    });
  } catch (err) {
    done(err, null);
  }
}));

app.use('/api', require('./routes/api'));
app.use('/api/levels', require('./routes/levels'));
app.use("/api", require('./routes/profiles'));
app.use("/api/license", require('./routes/license'));
app.use('/api/posts', require('./routes/posts'));

app.listen(PORT, () => {
  logger.info(`Website + API live at http://localhost:${PORT}`);
});
