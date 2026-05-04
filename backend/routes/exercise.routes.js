const express = require('express');
const router = express.Router();
const {
  getAllExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  submitAnswer,
} = require('../controllers/exercise.controller');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const createExerciseValidation = [
  body('lesson_id')
    .notEmpty()
    .withMessage('Lesson ID is required')
    .isInt()
    .withMessage('Lesson ID must be an integer'),
  body('type')
    .notEmpty()
    .withMessage('Exercise type is required')
    .isIn(['multiple-choice', 'fill-blank', 'matching', 'word-order', 'pronunciation', 'writing'])
    .withMessage('Invalid exercise type'),
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required'),
  body('correct_answer')
    .trim()
    .notEmpty()
    .withMessage('Correct answer is required'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty'),
];

const updateExerciseValidation = [
  body('type')
    .optional()
    .isIn(['multiple-choice', 'fill-blank', 'matching', 'word-order', 'pronunciation', 'writing'])
    .withMessage('Invalid exercise type'),
  body('question')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Question cannot be empty'),
  body('correct_answer')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Correct answer cannot be empty'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty'),
];

const submitAnswerValidation = [
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required'),
];

// Routes
router.get('/', optionalAuth, getAllExercises);
router.get('/:id', optionalAuth, getExercise);
router.post('/', verifyToken, isAdmin, createExerciseValidation, validate, createExercise);
router.put('/:id', verifyToken, isAdmin, updateExerciseValidation, validate, updateExercise);
router.delete('/:id', verifyToken, isAdmin, deleteExercise);
router.post('/:id/submit', verifyToken, submitAnswerValidation, validate, submitAnswer);

module.exports = router;
