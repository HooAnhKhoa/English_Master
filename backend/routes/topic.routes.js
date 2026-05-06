const express = require('express');
const router = express.Router();
const {
  getAllTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicVocabularies,
  getTopicAccessStats,
} = require('../controllers/topic.controller');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const createTopicValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Topic name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('name_vi')
    .trim()
    .notEmpty()
    .withMessage('Vietnamese name is required')
    .isLength({ max: 100 })
    .withMessage('Vietnamese name must not exceed 100 characters'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isLength({ max: 120 })
    .withMessage('Slug must not exceed 120 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('level')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Invalid level'),
];

const updateTopicValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Topic name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('name_vi')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vietnamese name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Vietnamese name must not exceed 100 characters'),
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
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
];

// Routes
router.get('/stats/access', verifyToken, isAdmin, getTopicAccessStats);
router.get('/', optionalAuth, getAllTopics);
router.get('/:id', optionalAuth, getTopic);
router.post('/', verifyToken, isAdmin, createTopicValidation, validate, createTopic);
router.put('/:id', verifyToken, isAdmin, updateTopicValidation, validate, updateTopic);
router.delete('/:id', verifyToken, isAdmin, deleteTopic);
router.get('/:id/vocabularies', optionalAuth, getTopicVocabularies);

module.exports = router;
