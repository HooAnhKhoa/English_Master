const { sequelize } = require('../config/database');
const { User, Ranking, Badge } = require('../models');
const badgeService = require('./badgeService');

// XP table - can be moved to system_settings table later
const XP_TABLE = {
  learn_new_word: 10,
  review_word_correct: 5,
  complete_lesson: 50,
  perfect_lesson: 80,
  video_segment: 15,
  pronunciation_perfect: 20,
  ai_conversation_turn: 8,
  first_word_of_day: 15,
};

// Level thresholds - XP required for each level
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
  { level: 6, xp: 2000 },
  { level: 7, xp: 3500 },
  { level: 8, xp: 5500 },
  { level: 9, xp: 8000 },
  { level: 10, xp: 11000 },
  { level: 11, xp: 15000 },
  { level: 12, xp: 20000 },
  { level: 13, xp: 26000 },
  { level: 14, xp: 33000 },
  { level: 15, xp: 41000 },
  { level: 16, xp: 50000 },
  { level: 17, xp: 60000 },
  { level: 18, xp: 72000 },
  { level: 19, xp: 85000 },
  { level: 20, xp: 100000 },
];

/**
 * Calculate level based on total XP
 */
function calculateLevel(totalXp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

/**
 * Get current period keys for rankings
 */
function getPeriodKeys() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Get ISO week number
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };

  return {
    daily: `${year}-${month}-${day}`,
    weekly: getWeekNumber(now),
    monthly: `${year}-${month}`,
    alltime: 'alltime',
  };
}

/**
 * Award XP to user and update rankings
 * @param {number} userId - User ID
 * @param {string} action - Action type (e.g., 'learn_new_word', 'complete_lesson')
 * @param {object} metadata - Additional metadata
 * @param {object} io - Socket.IO instance (optional)
 * @returns {Promise<object>} Result with xpGained, totalXp, levelUp, newLevel, newBadges
 */
async function awardXP(userId, action, metadata = {}, io = null) {
  const transaction = await sequelize.transaction();

  try {
    // Get XP amount for action
    const xpGained = XP_TABLE[action] || 0;

    if (xpGained === 0) {
      await transaction.rollback();
      return {
        xpGained: 0,
        totalXp: 0,
        levelUp: false,
        newLevel: 1,
        newBadges: [],
      };
    }

    // Get user's current XP and level
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      throw new Error('User not found');
    }

    const oldXp = user.xp;
    const oldLevel = calculateLevel(oldXp);

    // Update user XP
    await User.update(
      { xp: sequelize.literal(`xp + ${xpGained}`) },
      { where: { id: userId }, transaction }
    );

    // Get updated user data
    const updatedUser = await User.findByPk(userId, { transaction });
    const newXp = updatedUser.xp;
    const newLevel = calculateLevel(newXp);
    const levelUp = newLevel > oldLevel;

    // Update level if changed
    if (levelUp) {
      await User.update(
        { level: newLevel },
        { where: { id: userId }, transaction }
      );
    }

    // Update rankings for all periods
    const periodKeys = getPeriodKeys();
    const periods = ['daily', 'weekly', 'monthly', 'alltime'];

    for (const period of periods) {
      const periodKey = periodKeys[period];

      // Try to update existing ranking
      const [affectedRows] = await Ranking.update(
        { xp: sequelize.literal(`xp + ${xpGained}`) },
        {
          where: {
            user_id: userId,
            period,
            period_key: periodKey,
          },
          transaction,
        }
      );

      // If no rows affected, create new ranking record
      if (affectedRows === 0) {
        await Ranking.create(
          {
            user_id: userId,
            period,
            period_key: periodKey,
            xp: xpGained,
            words_learned: 0,
            lessons_completed: 0,
            streak_days: user.streak || 0,
          },
          { transaction }
        );
      }
    }

    // Check and award badges
    const newBadges = await badgeService.checkAndAward(userId, transaction);

    // Commit transaction
    await transaction.commit();

    // Emit Socket.IO event if io instance provided
    if (io) {
      io.to(`user:${userId}`).emit('xp-update', {
        xpGained,
        totalXp: newXp,
        levelUp,
        newLevel,
        oldLevel,
        newBadges,
        action,
        metadata,
      });

      // Emit ranking update to all users
      io.emit('ranking-update', {
        userId,
        period: 'all',
      });
    }

    return {
      xpGained,
      totalXp: newXp,
      levelUp,
      newLevel,
      oldLevel,
      newBadges,
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Error awarding XP:', error);
    throw error;
  }
}

/**
 * Get XP required for next level
 */
function getXpForNextLevel(currentLevel) {
  const nextLevelThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);
  return nextLevelThreshold ? nextLevelThreshold.xp : null;
}

/**
 * Get level progress percentage
 */
function getLevelProgress(currentXp) {
  const currentLevel = calculateLevel(currentXp);
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel);
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);

  if (!nextThreshold) {
    return 100; // Max level reached
  }

  const xpInCurrentLevel = currentXp - currentThreshold.xp;
  const xpNeededForNextLevel = nextThreshold.xp - currentThreshold.xp;
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return Math.min(Math.round(progress), 100);
}

module.exports = {
  awardXP,
  calculateLevel,
  getXpForNextLevel,
  getLevelProgress,
  XP_TABLE,
  LEVEL_THRESHOLDS,
};
