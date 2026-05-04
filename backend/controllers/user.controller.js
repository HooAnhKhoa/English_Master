const { User } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs').promises;

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = 'created_at',
    order = 'DESC',
    search,
    role,
    level,
    is_active,
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { full_name: { [Op.like]: `%${search}%` } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (level) {
    where.level = level;
  }

  if (is_active !== undefined) {
    where.is_active = is_active === 'true';
  }

  // Calculate pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Fetch users
  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
    order: [[sort, order.toUpperCase()]],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
    include: [
      {
        association: 'badges',
        through: { attributes: ['earned_at'] },
      },
    ],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 * @access  Private
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, full_name, level, is_active } = req.body;

  // Check if user exists
  const user = await User.findByPk(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check authorization (user can only update their own profile, unless admin)
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    throw new ApiError(403, 'Not authorized to update this user');
  }

  // Check if username is taken
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new ApiError(409, 'Username already taken');
    }
  }

  // Update user
  if (username) user.username = username;
  if (full_name) user.full_name = full_name;
  if (level) user.level = level;
  if (is_active !== undefined && req.user.role === 'admin') user.is_active = is_active;

  await user.save();

  // Remove sensitive data
  const userResponse = user.toJSON();
  delete userResponse.password;

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: userResponse,
  });
});

/**
 * @desc    Upload user avatar
 * @route   POST /api/v1/users/:id/avatar
 * @access  Private
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file');
  }

  // Check if user exists
  const user = await User.findByPk(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    throw new ApiError(403, 'Not authorized to update this user');
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'englishmaster/avatars', 'image');

    // Delete old avatar from Cloudinary if exists
    if (user.avatar) {
      const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
      await deleteFromCloudinary(publicId, 'image').catch(() => {});
    }

    // Update user avatar
    user.avatar = result.url;
    await user.save();

    // Delete local file
    await fs.unlink(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    // Delete local file on error
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Soft delete
  user.is_active = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/:id/stats
 * @access  Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: [
      'id',
      'username',
      'level',
      'xp',
      'coins',
      'streak',
      'total_words_learned',
      'total_lessons_completed',
    ],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  uploadAvatar,
  deleteUser,
  getUserStats,
};
