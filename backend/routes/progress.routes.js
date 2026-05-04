const express = require('express');
const router = express.Router();
const {
  getUserProgress,
  getItemProgress,
  updateProgress,
  getReviewItems,
  getProgressStats,
} = require('../controllers/progress.controller');
const { verifyToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const updateProgressValidation = [
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['lesson', 'vocabulary', 'topic'])
    .withMessage('Invalid type'),
  body('ref_id')
    .notEmpty()
    .withMessage('Reference ID is required')
    .isInt()
    .withMessage('Reference ID must be an integer'),
  body('status')
    .optional()
    .isIn(['not-started', 'in-progress', 'completed', 'mastered'])
    .withMessage('Invalid status'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('quality')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Quality must be between 0 and 5'),
];

// Routes
router.get('/', verifyToken, getUserProgress);
router.get('/stats', verifyToken, getProgressStats);
router.get('/review', verifyToken, getReviewItems);
router.get('/:type/:refId', verifyToken, getItemProgress);
router.post('/', verifyToken, updateProgressValidation, validate, updateProgress);

module.exports = router;
