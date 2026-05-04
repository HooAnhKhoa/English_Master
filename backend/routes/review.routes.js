const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// GET /api/v1/review/dashboard - Get review dashboard
router.get('/dashboard', reviewController.getDashboard);

// GET /api/v1/review/vocab/due - Get vocabularies due for review
router.get('/vocab/due', reviewController.getVocabDue);

// GET /api/v1/review/quiz/generate - Generate a new quiz
router.get('/quiz/generate', reviewController.generateQuiz);

// POST /api/v1/review/quiz/submit - Submit quiz answers
router.post('/quiz/submit', reviewController.submitQuiz);

// GET /api/v1/review/history - Get review history
router.get('/history', reviewController.getHistory);

module.exports = router;
