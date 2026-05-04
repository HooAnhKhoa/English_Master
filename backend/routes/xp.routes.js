const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const xpService = require('../services/xpService');

/**
 * @desc    Award XP to user
 * @route   POST /api/v1/xp/award
 * @access  Private
 */
router.post('/award', verifyToken, async (req, res) => {
  try {
    const { action, metadata } = req.body;
    const userId = req.user.id;

    // Get Socket.IO instance
    const io = req.app.get('io');

    const result = await xpService.awardXP(userId, action, metadata, io);

    res.status(200).json({
      success: true,
      message: 'XP awarded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to award XP',
    });
  }
});

/**
 * @desc    Get user's level info
 * @route   GET /api/v1/xp/level
 * @access  Private
 */
router.get('/level', verifyToken, async (req, res) => {
  try {
    const { User } = require('../models');
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentLevel = xpService.calculateLevel(user.xp);
    const nextLevelXp = xpService.getXpForNextLevel(currentLevel);
    const progress = xpService.getLevelProgress(user.xp);

    res.status(200).json({
      success: true,
      data: {
        currentXp: user.xp,
        currentLevel,
        nextLevelXp,
        progress,
        levelThresholds: xpService.LEVEL_THRESHOLDS,
      },
    });
  } catch (error) {
    console.error('Error getting level info:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get level info',
    });
  }
});

/**
 * @desc    Get XP table
 * @route   GET /api/v1/xp/table
 * @access  Public
 */
router.get('/table', (req, res) => {
  res.status(200).json({
    success: true,
    data: xpService.XP_TABLE,
  });
});

module.exports = router;
