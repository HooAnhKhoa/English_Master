const { User, UserProgress, Quiz, ReviewHistory, Badge, UserBadge, Vocabulary, Lesson, Video, Topic } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

/**
 * POST /api/user/avatar
 * Upload avatar (local storage version - no Cloudinary)
 */
exports.uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  try {
    // Delete old avatar file if exists (local file only)
    if (user.avatar && !user.avatar.includes('cloudinary') && !user.avatar.includes('http')) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      await fs.unlink(oldAvatarPath).catch(() => {});
    }

    // Generate avatar URL (relative path)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl: user.avatar }
    });
  } catch (error) {
    // Delete uploaded file on error
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

module.exports = exports;
