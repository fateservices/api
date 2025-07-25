const express = require('express');
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/auth');
const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await UserProfile.findOneAndUpdate(
      { userId: req.user.userId },
      updates,
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { 
      search, 
      interests, 
      games, 
      hobbies, 
      gender, 
      lookingFor,
      tags,
      personalityTags,
      conversationStyle,
      activityPreferences,
      mbti
    } = req.query;

    let query = { userId: { $ne: req.user.userId } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : [interests];
      query.interests = { $in: interestArray };
    }

    if (games) {
      const gameArray = Array.isArray(games) ? games : [games];
      query.games = { $in: gameArray };
    }

    if (hobbies) {
      const hobbyArray = Array.isArray(hobbies) ? hobbies : [hobbies];
      query.hobbies = { $in: hobbyArray };
    }

    if (gender && gender !== '⭕ Not specified') {
      query.gender = gender;
    }

    if (lookingFor && lookingFor !== '⭕ Not specified') {
      query.lookingFor = lookingFor;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (personalityTags) {
      const personalityArray = Array.isArray(personalityTags) ? personalityTags : [personalityTags];
      query.personalityTags = { $in: personalityArray };
    }

    if (conversationStyle) {
      const styleArray = Array.isArray(conversationStyle) ? conversationStyle : [conversationStyle];
      query.conversationStyle = { $in: styleArray };
    }

    if (activityPreferences) {
      const activityArray = Array.isArray(activityPreferences) ? activityPreferences : [activityPreferences];
      query.activityPreferences = { $in: activityArray };
    }

    if (mbti && mbti !== '⭕ Not specified') {
      query.mbti = mbti;
    }

    const users = await UserProfile.find(query)
      .select('-__v')
      .limit(50)
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await UserProfile.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;