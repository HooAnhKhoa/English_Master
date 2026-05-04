const express = require('express');
const router = express.Router();
const {
  searchWord,
  getSuggestions,
  getWordOfDay,
  saveWord,
  getSavedWords,
  getSearchHistory,
} = require('../controllers/dictionary.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const saveWordValidation = [
  body('word')
    .trim()
    .notEmpty()
    .withMessage('Word is required')
    .isLength({ max: 100 })
    .withMessage('Word must not exceed 100 characters'),
];

// Routes
router.get('/search/:word', optionalAuth, searchWord);
router.get('/suggest', optionalAuth, getSuggestions);
router.get('/word-of-day', optionalAuth, getWordOfDay);
router.post('/save', verifyToken, saveWordValidation, validate, saveWord);
router.get('/saved', verifyToken, getSavedWords);
router.get('/history', verifyToken, getSearchHistory);

module.exports = router;
