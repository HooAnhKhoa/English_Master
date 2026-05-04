const express = require('express');
const router = express.Router();
const {
  getAllVocabularies,
  getVocabulary,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  uploadVocabularyImage,
  uploadVocabularyAudio,
} = require('../controllers/vocabulary.controller');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const createVocabularyValidation = [
  body('word')
    .trim()
    .notEmpty()
    .withMessage('Word is required')
    .isLength({ max: 100 })
    .withMessage('Word must not exceed 100 characters'),
  body('part_of_speech')
    .notEmpty()
    .withMessage('Part of speech is required')
    .isIn(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection'])
    .withMessage('Invalid part of speech'),
  body('meaning')
    .trim()
    .notEmpty()
    .withMessage('Meaning is required')
    .isLength({ max: 500 })
    .withMessage('Meaning must not exceed 500 characters'),
  body('level')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Invalid level'),
  body('topic_id')
    .optional()
    .isInt()
    .withMessage('Topic ID must be an integer'),
];

const updateVocabularyValidation = [
  body('word')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Word cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Word must not exceed 100 characters'),
  body('part_of_speech')
    .optional()
    .isIn(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection'])
    .withMessage('Invalid part of speech'),
  body('meaning')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Meaning cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Meaning must not exceed 500 characters'),
  body('level')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Invalid level'),
  body('topic_id')
    .optional()
    .isInt()
    .withMessage('Topic ID must be an integer'),
];

// Routes
router.get('/', optionalAuth, getAllVocabularies);
router.get('/:id', optionalAuth, getVocabulary);
router.post('/', verifyToken, isAdmin, createVocabularyValidation, validate, createVocabulary);
router.put('/:id', verifyToken, isAdmin, updateVocabularyValidation, validate, updateVocabulary);
router.delete('/:id', verifyToken, isAdmin, deleteVocabulary);
router.post('/:id/image', verifyToken, isAdmin, uploadLimiter, upload.single('image'), handleMulterError, uploadVocabularyImage);
router.post('/:id/audio', verifyToken, isAdmin, uploadLimiter, upload.single('audio'), handleMulterError, uploadVocabularyAudio);

module.exports = router;
