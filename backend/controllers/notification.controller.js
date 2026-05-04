const { Notification, User } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, is_read, type } = req.query;
  const userId = req.user.id;

  // Build where clause
  const where = { user_id: userId };

  if (is_read !== undefined) {
    where.is_read = is_read === 'true';
  }

  if (type) {
    where.type = type;
  }

  // Calculate pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Fetch notifications
  const { count, rows: notifications } = await Notification.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await Notification.count({
    where: {
      user_id: userId,
      is_read: false,
    },
  });

  res.status(200).json({
    success: true,
    data: { count },
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    where: { id, user_id: userId },
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.is_read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Notification.update(
    { is_read: true },
    {
      where: {
        user_id: userId,
        is_read: false,
      },
    }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    where: { id, user_id: userId },
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await notification.destroy();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
  });
});

/**
 * @desc    Create notification (Internal use / Admin)
 * @route   POST /api/v1/notifications
 * @access  Private/Admin
 */
const createNotification = asyncHandler(async (req, res) => {
  const { user_id, type, title, message, data } = req.body;

  // Check if user exists
  const user = await User.findByPk(user_id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Create notification
  const notification = await Notification.create({
    user_id,
    type,
    title,
    message,
    data,
  });

  // Send real-time notification via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${user_id}`).emit('notification', notification);
  }

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification,
  });
});

/**
 * Helper function: Send notification to user
 * @param {number} userId - User ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data
 * @param {object} io - Socket.IO instance
 */
const sendNotification = async (userId, type, title, message, data = null, io = null) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      data,
    });

    // Send real-time notification
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendNotification,
};
