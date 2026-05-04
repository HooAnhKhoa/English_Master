const express = require('express');
const router = express.Router();
const {
  startConversation,
  sendMessage,
  getConversation,
  getAllConversations,
  endConversation,
  analyzeText,
  upload,
} = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const startConversationValidation = [
  body('scenario')
    .optional()
    .isIn([
      'job_interview',
      'ordering_food',
      'travel',
      'shopping',
      'daily_conversation',
      'business_meeting',
      'making_friends',
    ])
    .withMessage('Invalid scenario'),
  body('topic')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Topic must not exceed 200 characters'),
];

const sendMessageValidation = [
  body('text')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters'),
];

const analyzeTextValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Text is required')
    .isLength({ max: 1000 })
    .withMessage('Text must not exceed 1000 characters'),
  body('level')
    .optional()
    .isIn(['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'])
    .withMessage('Invalid level'),
];

/**
 * @route   POST /api/v1/ai/conversations
 * @desc    Start new AI conversation
 * @access  Private
 */
router.post(
  '/conversations',
  verifyToken,
  aiLimiter,
  startConversationValidation,
  validate,
  startConversation
);

/**
 * @route   GET /api/v1/ai/conversations
 * @desc    Get all user conversations
 * @access  Private
 */
router.get('/conversations', verifyToken, getAllConversations);

/**
 * @route   GET /api/v1/ai/conversations/:id
 * @desc    Get conversation history
 * @access  Private
 */
router.get('/conversations/:id', verifyToken, getConversation);

/**
 * @route   POST /api/v1/ai/conversations/:id/messages
 * @desc    Send message in conversation (with optional audio)
 * @access  Private
 */
router.post(
  '/conversations/:id/messages',
  verifyToken,
  aiLimiter,
  upload,
  sendMessageValidation,
  validate,
  sendMessage
);

/**
 * @route   POST /api/v1/ai/conversations/:id/end
 * @desc    End conversation and get scorecard
 * @access  Private
 */
router.post('/conversations/:id/end', verifyToken, endConversation);

/**
 * @route   POST /api/v1/ai/analyze
 * @desc    Analyze text grammar
 * @access  Private
 */
router.post('/analyze', verifyToken, aiLimiter, analyzeTextValidation, validate, analyzeText);

module.exports = router;
