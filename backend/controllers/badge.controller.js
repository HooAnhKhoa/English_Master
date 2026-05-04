const { Badge, User } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { sequelize } = require('../config/database');
const badgeService = require('../services/badgeService');

/**
 * @desc    Get all badges
 * @route   GET /api/v1/badges
 * @access  Public
 */
const getAllBadges = asyncHandler(async (req, res) => {
  const { rarity, condition_type } = req.query;

  // Build where clause
  const where = {};

  if (rarity) {
    where.rarity = rarity;
  }

  if (condition_type) {
    where.condition_type = condition_type;
  }

  const badges = await Badge.findAll({
    where,
    order: [['condition_value', 'ASC']],
  });

  res.status(200).json({
    success: true,
    data: badges,
  });
});

/**
 * @desc    Get single badge
 * @route   GET /api/v1/badges/:id
 * @access  Public
 */
const getBadge = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const badge = await Badge.findByPk(id);

  if (!badge) {
    throw new ApiError(404, 'Badge not found');
  }

  res.status(200).json({
    success: true,
    data: badge,
  });
});

/**
 * @desc    Get user badges
 * @route   GET /api/v1/badges/user/:userId
 * @access  Public
 */
const getUserBadges = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const badges = await badgeService.getUserBadges(parseInt(userId));

  res.status(200).json({
    success: true,
    data: badges,
  });
});

/**
 * @desc    Check and award badges to user
 * @route   POST /api/v1/badges/check
 * @access  Private
 */
const checkAndAwardBadges = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const newBadges = await badgeService.checkAndAward(userId);

  res.status(200).json({
    success: true,
    message: newBadges.length > 0 ? 'New badges earned!' : 'No new badges',
    data: {
      newBadges,
      totalXpEarned: newBadges.reduce((sum, b) => sum + b.xpReward, 0),
    },
  });
});

/**
 * @desc    Create new badge (Admin only)
 * @route   POST /api/v1/badges
 * @access  Private/Admin
 */
const createBadge = asyncHandler(async (req, res) => {
  const {
    name,
    name_vi,
    description,
    icon,
    condition_type,
    condition_value,
    xp_reward,
    rarity,
  } = req.body;

  const badge = await Badge.create({
    name,
    name_vi,
    description,
    icon,
    condition_type,
    condition_value,
    xp_reward: xp_reward || 0,
    rarity: rarity || 'common',
  });

  res.status(201).json({
    success: true,
    message: 'Badge created successfully',
    data: badge,
  });
});

/**
 * @desc    Update badge (Admin only)
 * @route   PUT /api/v1/badges/:id
 * @access  Private/Admin
 */
const updateBadge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    name_vi,
    description,
    icon,
    condition_type,
    condition_value,
    xp_reward,
    rarity,
  } = req.body;

  const badge = await Badge.findByPk(id);

  if (!badge) {
    throw new ApiError(404, 'Badge not found');
  }

  // Update badge
  if (name) badge.name = name;
  if (name_vi) badge.name_vi = name_vi;
  if (description !== undefined) badge.description = description;
  if (icon !== undefined) badge.icon = icon;
  if (condition_type) badge.condition_type = condition_type;
  if (condition_value !== undefined) badge.condition_value = condition_value;
  if (xp_reward !== undefined) badge.xp_reward = xp_reward;
  if (rarity) badge.rarity = rarity;

  await badge.save();

  res.status(200).json({
    success: true,
    message: 'Badge updated successfully',
    data: badge,
  });
});

/**
 * @desc    Delete badge (Admin only)
 * @route   DELETE /api/v1/badges/:id
 * @access  Private/Admin
 */
const deleteBadge = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const badge = await Badge.findByPk(id);

  if (!badge) {
    throw new ApiError(404, 'Badge not found');
  }

  await badge.destroy();

  res.status(200).json({
    success: true,
    message: 'Badge deleted successfully',
  });
});

module.exports = {
  getAllBadges,
  getBadge,
  getUserBadges,
  checkAndAwardBadges,
  createBadge,
  updateBadge,
  deleteBadge,
};
