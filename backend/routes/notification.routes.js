const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} = require('../controllers/notification.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const createNotificationValidation = [
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt()
    .withMessage('User ID must be an integer'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['streak', 'badge', 'reminder', 'system', 'ranking'])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required'),
];

// Routes
router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/:id/read', verifyToken, markAsRead);
router.put('/read-all', verifyToken, markAllAsRead);
router.delete('/:id', verifyToken, deleteNotification);
router.post('/', verifyToken, isAdmin, createNotificationValidation, validate, createNotification);

module.exports = router;
