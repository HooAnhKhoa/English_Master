const { Ranking, User } = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');

/**
 * Get period key for a given period type
 * @param {string} period - 'daily', 'weekly', 'monthly', 'alltime'
 * @param {Date} date - Date to calculate period key for (defaults to now)
 * @returns {string} Period key
 */
function getPeriodKey(period, date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (period) {
    case 'daily':
      return `${year}-${month}-${day}`;

    case 'weekly': {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }

    case 'monthly':
      return `${year}-${month}`;

    case 'alltime':
      return 'alltime';

    default:
      throw new Error(`Invalid period: ${period}`);
  }
}

/**
 * Get leaderboard for a specific period
 * @param {string} period - 'daily', 'weekly', 'monthly', 'alltime'
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Promise<object>} Leaderboard data with rankings and pagination
 */
async function getLeaderboard(period = 'daily', page = 1, limit = 20) {
  try {
    const periodKey = getPeriodKey(period);
    const offset = (page - 1) * limit;

    // Get rankings with user data, exclude admin users
    const { rows, count } = await Ranking.findAndCountAll({
      where: {
        period,
        period_key: periodKey,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name', 'avatar', 'level', 'xp', 'role'],
          where: {
            role: {
              [Op.ne]: 'admin'
            }
          }
        },
      ],
      order: [['xp', 'DESC']],
      limit,
      offset,
    });

    // Add rank position to each entry
    const rankings = rows.map((ranking, index) => ({
      rank: offset + index + 1,
      userId: ranking.user_id,
      username: ranking.user.username,
      fullName: ranking.user.full_name,
      avatar: ranking.user.avatar,
      level: ranking.user.level,
      totalXp: ranking.user.xp,
      periodXp: ranking.xp,
      wordsLearned: ranking.words_learned,
      lessonsCompleted: ranking.lessons_completed,
      streakDays: ranking.streak_days,
    }));

    return {
      period,
      periodKey,
      rankings,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

/**
 * Get user's rank in a specific period
 * @param {number} userId - User ID
 * @param {string} period - 'daily', 'weekly', 'monthly', 'alltime'
 * @returns {Promise<object>} User's rank data
 */
async function getUserRank(userId, period = 'daily') {
  try {
    const periodKey = getPeriodKey(period);

    // Get user's ranking
    const userRanking = await Ranking.findOne({
      where: {
        user_id: userId,
        period,
        period_key: periodKey,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name', 'avatar', 'level', 'xp'],
        },
      ],
    });

    if (!userRanking) {
      return {
        rank: null,
        periodXp: 0,
        totalUsers: 0,
      };
    }

    // Count users with higher XP to determine rank
    const higherRankCount = await Ranking.count({
      where: {
        period,
        period_key: periodKey,
        xp: {
          [Op.gt]: userRanking.xp,
        },
      },
    });

    const rank = higherRankCount + 1;

    // Get total users in this period
    const totalUsers = await Ranking.count({
      where: {
        period,
        period_key: periodKey,
      },
    });

    return {
      rank,
      userId: userRanking.user_id,
      username: userRanking.user.username,
      fullName: userRanking.user.full_name,
      avatar: userRanking.user.avatar,
      level: userRanking.user.level,
      totalXp: userRanking.user.xp,
      periodXp: userRanking.xp,
      wordsLearned: userRanking.words_learned,
      lessonsCompleted: userRanking.lessons_completed,
      streakDays: userRanking.streak_days,
      totalUsers,
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw error;
  }
}

/**
 * Get top N users for a period
 * @param {string} period - Period type
 * @param {number} topN - Number of top users to retrieve
 * @returns {Promise<Array>} Top users
 */
async function getTopUsers(period = 'daily', topN = 3) {
  try {
    const periodKey = getPeriodKey(period);

    const rankings = await Ranking.findAll({
      where: {
        period,
        period_key: periodKey,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name', 'avatar', 'level', 'xp'],
        },
      ],
      order: [['xp', 'DESC']],
      limit: topN,
    });

    return rankings.map((ranking, index) => ({
      rank: index + 1,
      userId: ranking.user_id,
      username: ranking.user.username,
      fullName: ranking.user.full_name,
      avatar: ranking.user.avatar,
      level: ranking.user.level,
      totalXp: ranking.user.xp,
      periodXp: ranking.xp,
    }));
  } catch (error) {
    console.error('Error getting top users:', error);
    throw error;
  }
}

/**
 * Initialize cron job for daily ranking reset
 * Runs at 00:00 every day to create new daily ranking records
 */
function initializeCronJobs() {
  // Run at 00:00 every day
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running daily ranking reset...');
    try {
      const today = getPeriodKey('daily');
      console.log(`✅ New daily ranking period created: ${today}`);
      // New records will be created automatically when users earn XP
    } catch (error) {
      console.error('❌ Error in daily ranking reset:', error);
    }
  });

  console.log('✅ Ranking cron jobs initialized');
}

module.exports = {
  getPeriodKey,
  getLeaderboard,
  getUserRank,
  getTopUsers,
  initializeCronJobs,
};
