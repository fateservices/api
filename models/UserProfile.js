const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  profileId: Number,
  uuid: String,
  name: { type: String, required: true },
  avatar: { type: String },
  gender: { type: String, default: "⭕ Not specified" },
  pronouns: { type: String, default: "⭕ Not specified" },
  bio: { type: String, default: "⭕ Not specified" },
  timezone: { type: String, default: "⭕ Not specified" },
  games: { type: [String], default: [] },
  hobbies: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  lookingFor: { type: String, default: "⭕ Not specified" },
  messageId: { type: String, default: null },
  channelId: { type: String, default: null },
  lastBump: { type: Date, default: null },
  tags: { type: [String], default: [] },
  personalityTags: { type: [String], default: [] },
  conversationStyle: { type: [String], default: [] },
  activityPreferences: { type: [String], default: [] },
  threeEmojis: { type: String, default: "⭕ Not specified" },
  favoriteQuote: { type: String, default: "⭕ Not specified" },
  vibe: { type: String, default: "⭕ Not specified" },
  mbti: { type: String, default: "⭕ Not specified" },
  music: { type: String, default: "⭕ Not specified" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserProfile", userProfileSchema);