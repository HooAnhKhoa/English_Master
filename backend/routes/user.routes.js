const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  uploadAvatar,
  deleteUser,
  getUserStats,
} = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const updateUserValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('level')
    .optional()
    .isIn(['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'])
    .withMessage('Invalid level'),
];

// Routes
router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/:id', verifyToken, getUser);
router.put('/:id', verifyToken, updateUserValidation, validate, updateUser);
router.post('/:id/avatar', verifyToken, uploadLimiter, upload.single('avatar'), handleMulterError, uploadAvatar);
router.delete('/:id', verifyToken, isAdmin, deleteUser);
router.get('/:id/stats', verifyToken, getUserStats);

module.exports = router;
