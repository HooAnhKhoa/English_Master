const express = require('express');
const router = express.Router();
const {
  startConversation,
  sendMessage,
  getConversation,
  getAllConversations,
  endConversation,
  analyzeText,
} = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const startConversationValidation = [
  body('scenario')
    .optional()
    .isIn(['job_interview', 'ordering_food', 'travel', 'shopping', 'daily_conversation', 'business_meeting', 'making_friends'])
    .withMessage('Invalid scenario'),
  body('topic')
    .if(body('topic').exists())
    .if(body('topic').not().equals(null))
    .trim()
    .isLength({ max: 100 })
    .withMessage('Topic must not exceed 100 characters'),
  body('level')
    .optional()
    .isIn(['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'])
    .withMessage('Invalid level'),
];

const sendMessageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
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

// Routes
router.post('/conversations', verifyToken, aiLimiter, startConversationValidation, validate, startConversation);
router.get('/conversations', verifyToken, getAllConversations);
router.get('/conversations/:id', verifyToken, getConversation);
router.post('/conversations/:id/messages', verifyToken, aiLimiter, sendMessageValidation, validate, sendMessage);
router.post('/conversations/:id/end', verifyToken, endConversation);
router.post('/analyze', verifyToken, aiLimiter, analyzeTextValidation, validate, analyzeText);

module.exports = router;
