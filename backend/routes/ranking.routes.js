const express = require('express');
const router = express.Router();
const {
  getRankings,
  getMyRank,
  updateRanking,
} = require('../controllers/ranking.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// Routes
router.get('/', optionalAuth, getRankings);
router.get('/me', verifyToken, getMyRank);
router.post('/update', verifyToken, updateRanking);

module.exports = router;
