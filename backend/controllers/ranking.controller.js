const { Ranking, User } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { cache } = require('../config/redis');
const rankingService = require('../services/rankingService');

/**
 * @desc    Get rankings
 * @route   GET /api/v1/rankings
 * @access  Public
 */
const getRankings = asyncHandler(async (req, res) => {
  const { period = 'daily', page = 1, limit = 20 } = req.query;

  // Try to get from cache
  const periodKey = rankingService.getPeriodKey(period);
  const cacheKey = `rankings:${period}:${periodKey}:${page}:${limit}`;
  const cachedData = await cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      ...cachedData,
      cached: true,
    });
  }

  // Get leaderboard from service
  const result = await rankingService.getLeaderboard(period, parseInt(page), parseInt(limit));

  // Cache for 2 minutes
  await cache.set(cacheKey, result, 120);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get user rank
 * @route   GET /api/v1/rankings/me
 * @access  Private
 */
const getMyRank = asyncHandler(async (req, res) => {
  const { period = 'daily' } = req.query;
  const userId = req.user.id;

  const rankData = await rankingService.getUserRank(userId, period);

  res.status(200).json({
    success: true,
    data: rankData,
  });
});

/**
 * @desc    Update user ranking (called internally after XP gain)
 * @route   POST /api/v1/rankings/update
 * @access  Private
 */
const updateRanking = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Update rankings for all periods
  const periods = ['daily', 'weekly', 'monthly', 'alltime'];

  for (const period of periods) {
    const periodKey = generatePeriodKey(period);

    const [ranking] = await Ranking.findOrCreate({
      where: {
        user_id: userId,
        period,
        period_key: periodKey,
      },
      defaults: {
        xp: user.xp,
        words_learned: user.total_words_learned,
        lessons_completed: user.total_lessons_completed,
        streak_days: user.streak,
      },
    });

    // Update ranking
    ranking.xp = user.xp;
    ranking.words_learned = user.total_words_learned;
    ranking.lessons_completed = user.total_lessons_completed;
    ranking.streak_days = user.streak;
    await ranking.save();
  }

  // Clear cache
  await cache.delPattern('rankings:*');

  res.status(200).json({
    success: true,
    message: 'Rankings updated successfully',
  });
});

/**
 * Helper function: Generate period key
 * @param {string} period - Period type (daily, weekly, monthly, alltime)
 * @returns {string} Period key
 */
function generatePeriodKey(period) {
  const now = new Date();

  switch (period) {
    case 'daily':
      return now.toISOString().split('T')[0]; // 2026-05-02
    case 'weekly':
      const year = now.getFullYear();
      const week = getWeekNumber(now);
      return `${year}-W${String(week).padStart(2, '0')}`; // 2026-W18
    case 'monthly':
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // 2026-05
    case 'alltime':
      return 'alltime';
    default:
      return 'alltime';
  }
}

/**
 * Helper function: Get week number
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

module.exports = {
  getRankings,
  getMyRank,
  updateRanking,
};
