const express = require('express');
const router = express.Router();
const {
  getAllLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  addVocabulariesToLesson,
  removeVocabularyFromLesson,
} = require('../controllers/lesson.controller');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const createLessonValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('level')
    .notEmpty()
    .withMessage('Level is required')
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Invalid level'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['grammar', 'vocabulary', 'listening', 'speaking', 'reading', 'writing'])
    .withMessage('Invalid category'),
];

const updateLessonValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('level')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Invalid level'),
  body('category')
    .optional()
    .isIn(['grammar', 'vocabulary', 'listening', 'speaking', 'reading', 'writing'])
    .withMessage('Invalid category'),
  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),
];

const addVocabulariesValidation = [
  body('vocabulary_ids')
    .isArray({ min: 1 })
    .withMessage('vocabulary_ids must be a non-empty array'),
  body('vocabulary_ids.*')
    .isInt()
    .withMessage('Each vocabulary ID must be an integer'),
];

// Routes
router.get('/', optionalAuth, getAllLessons);
router.get('/:id', optionalAuth, getLesson);
router.post('/', verifyToken, isAdmin, createLessonValidation, validate, createLesson);
router.put('/:id', verifyToken, isAdmin, updateLessonValidation, validate, updateLesson);
router.delete('/:id', verifyToken, isAdmin, deleteLesson);
router.post('/:id/vocabularies', verifyToken, isAdmin, addVocabulariesValidation, validate, addVocabulariesToLesson);
router.delete('/:id/vocabularies/:vocabId', verifyToken, isAdmin, removeVocabularyFromLesson);

module.exports = router;
