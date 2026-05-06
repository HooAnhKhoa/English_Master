const express = require('express');
const router = express.Router();
const vocabController = require('../controllers/vocab.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

/**
 * @route   GET /api/v1/vocab/topics
 * @desc    Get all topics with word count and user progress
 * @access  Public (optionalAuth)
 */
router.get('/topics', optionalAuth, vocabController.getAllTopics);

/**
 * @route   GET /api/v1/vocab/topics/:slug
 * @desc    Get topic detail with vocabulary list
 * @access  Public (optionalAuth)
 */
router.get('/topics/:slug', optionalAuth, vocabController.getTopicBySlug);

/**
 * @route   GET /api/v1/vocab/search
 * @desc    Search vocabulary
 * @access  Public (optionalAuth)
 */
router.get('/search', optionalAuth, vocabController.searchVocabulary);

/**
 * @route   GET /api/v1/vocab/today
 * @desc    Get today's vocabulary review list (words due for review)
 * @access  Private
 */
router.get('/today', verifyToken, vocabController.getTodayVocab);

/**
 * @route   GET /api/v1/vocab/random
 * @desc    Get random vocabulary words for practice (not necessarily due)
 * @access  Private
 */
router.get('/random', verifyToken, vocabController.getRandomVocab);

/**
 * @route   GET /api/v1/vocab/stats
 * @desc    Get vocabulary learning statistics
 * @access  Private
 */
router.get('/stats', verifyToken, vocabController.getVocabStats);

/**
 * @route   GET /api/v1/vocab/:id
 * @desc    Get vocabulary detail by ID
 * @access  Public (optionalAuth)
 */
router.get('/:id', optionalAuth, vocabController.getVocabById);

/**
 * @route   POST /api/v1/vocab/start-learning
 * @desc    Start learning vocabulary
 * @access  Private
 */
router.post('/start-learning', verifyToken, vocabController.startLearning);

/**
 * @route   POST /api/v1/vocab/flashcard/review
 * @desc    Review a flashcard and update progress
 * @access  Private
 */
router.post(
  '/flashcard/review',
  verifyToken,
  [
    body('vocabId').isInt({ min: 1 }).withMessage('Valid vocabulary ID is required'),
    body('quality')
      .custom((value) => {
        if (typeof value === 'number') {
          return value >= 0 && value <= 5;
        }
        return ['forgot', 'hard', 'good', 'easy'].includes(value);
      })
      .withMessage('Quality must be 0-5 or one of: forgot, hard, good, easy'),
    body('responseTimeMs').optional().isInt({ min: 0 }).withMessage('Response time must be a positive integer'),
    validate,
  ],
  vocabController.reviewFlashcard
);

module.exports = router;
