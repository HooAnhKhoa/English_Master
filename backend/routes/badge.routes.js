const express = require('express');
const router = express.Router();
const {
  getAllBadges,
  getBadge,
  getUserBadges,
  checkAndAwardBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} = require('../controllers/badge.controller');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const createBadgeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Badge name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('name_vi')
    .trim()
    .notEmpty()
    .withMessage('Vietnamese name is required')
    .isLength({ max: 100 })
    .withMessage('Vietnamese name must not exceed 100 characters'),
  body('condition_type')
    .notEmpty()
    .withMessage('Condition type is required')
    .isIn(['words_learned', 'streak', 'lessons_completed', 'xp', 'video_completed', 'ai_turns', 'perfect_score'])
    .withMessage('Invalid condition type'),
  body('condition_value')
    .notEmpty()
    .withMessage('Condition value is required')
    .isInt({ min: 1 })
    .withMessage('Condition value must be a positive integer'),
  body('rarity')
    .optional()
    .isIn(['common', 'rare', 'epic', 'legendary'])
    .withMessage('Invalid rarity'),
];

const updateBadgeValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Badge name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('name_vi')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vietnamese name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Vietnamese name must not exceed 100 characters'),
  body('condition_type')
    .optional()
    .isIn(['words_learned', 'streak', 'lessons_completed', 'xp', 'video_completed', 'ai_turns', 'perfect_score'])
    .withMessage('Invalid condition type'),
  body('condition_value')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Condition value must be a positive integer'),
  body('rarity')
    .optional()
    .isIn(['common', 'rare', 'epic', 'legendary'])
    .withMessage('Invalid rarity'),
];

// Routes
router.get('/', optionalAuth, getAllBadges);
router.get('/:id', optionalAuth, getBadge);
router.get('/user/:userId', optionalAuth, getUserBadges);
router.post('/check', verifyToken, checkAndAwardBadges);
router.post('/', verifyToken, isAdmin, createBadgeValidation, validate, createBadge);
router.put('/:id', verifyToken, isAdmin, updateBadgeValidation, validate, updateBadge);
router.delete('/:id', verifyToken, isAdmin, deleteBadge);

module.exports = router;
