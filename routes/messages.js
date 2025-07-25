const express = require('express');
const Message = require('../models/Message');
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/auth');
const router = express.Router();

// Get conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user.userId },
            { receiverId: req.user.userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', req.user.userId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', req.user.userId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const otherUser = await UserProfile.findOne({ userId: conv._id });
        return {
          userId: conv._id,
          user: otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.userId, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.userId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user.userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = new Message({
      senderId: req.user.userId,
      receiverId,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;