const { Badge, User } = require('../models');
const { sequelize } = require('../config/database');

/**
 * Check user stats against badge conditions and award new badges
 * @param {number} userId - User ID
 * @param {object} transaction - Sequelize transaction (optional)
 * @returns {Promise<Array>} Array of newly awarded badges
 */
async function checkAndAward(userId, transaction = null) {
  const t = transaction || (await sequelize.transaction());
  const shouldCommit = !transaction;

  try {
    // Get user with current stats
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Badge,
          as: 'badges',
          through: { attributes: ['awarded_at'] },
        },
      ],
      transaction: t,
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get all badges user doesn't have yet
    const userBadgeIds = user.badges.map((b) => b.id);
    const availableBadges = await Badge.findAll({
      where: {
        id: {
          [sequelize.Sequelize.Op.notIn]: userBadgeIds.length > 0 ? userBadgeIds : [0],
        },
      },
      transaction: t,
    });

    const newBadges = [];

    // Check each badge condition
    for (const badge of availableBadges) {
      let conditionMet = false;

      switch (badge.condition_type) {
        case 'words_learned':
          conditionMet = user.total_words_learned >= badge.condition_value;
          break;

        case 'streak':
          conditionMet = user.streak >= badge.condition_value;
          break;

        case 'lessons_completed':
          conditionMet = user.total_lessons_completed >= badge.condition_value;
          break;

        case 'xp':
          conditionMet = user.xp >= badge.condition_value;
          break;

        case 'video_completed':
          // Count completed videos from user_video_progress
          const videoCount = await sequelize.query(
            `SELECT COUNT(DISTINCT video_id) as count
             FROM user_video_progress
             WHERE user_id = ? AND completed = 1`,
            {
              replacements: [userId],
              type: sequelize.QueryTypes.SELECT,
              transaction: t,
            }
          );
          conditionMet = videoCount[0]?.count >= badge.condition_value;
          break;

        case 'ai_turns':
          // Count AI conversation turns
          const aiTurnCount = await sequelize.query(
            `SELECT COUNT(*) as count
             FROM ai_messages
             WHERE conversation_id IN (
               SELECT id FROM ai_conversations WHERE user_id = ?
             ) AND role = 'user'`,
            {
              replacements: [userId],
              type: sequelize.QueryTypes.SELECT,
              transaction: t,
            }
          );
          conditionMet = aiTurnCount[0]?.count >= badge.condition_value;
          break;

        case 'perfect_score':
          // Count lessons with perfect score (100%)
          const perfectCount = await sequelize.query(
            `SELECT COUNT(*) as count
             FROM user_progress
             WHERE user_id = ? AND type = 'lesson' AND score = 100`,
            {
              replacements: [userId],
              type: sequelize.QueryTypes.SELECT,
              transaction: t,
            }
          );
          conditionMet = perfectCount[0]?.count >= badge.condition_value;
          break;

        default:
          console.warn(`Unknown badge condition type: ${badge.condition_type}`);
      }

      // Award badge if condition met
      if (conditionMet) {
        // Insert into user_badges junction table
        await sequelize.query(
          `INSERT INTO user_badges (user_id, badge_id, awarded_at, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW(), NOW())`,
          {
            replacements: [userId, badge.id],
            type: sequelize.QueryTypes.INSERT,
            transaction: t,
          }
        );

        // Award XP reward
        if (badge.xp_reward > 0) {
          await User.update(
            { xp: sequelize.literal(`xp + ${badge.xp_reward}`) },
            { where: { id: userId }, transaction: t }
          );
        }

        newBadges.push({
          id: badge.id,
          name: badge.name,
          nameVi: badge.name_vi,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity,
          xpReward: badge.xp_reward,
        });
      }
    }

    if (shouldCommit) {
      await t.commit();
    }

    return newBadges;
  } catch (error) {
    if (shouldCommit) {
      await t.rollback();
    }
    console.error('Error checking and awarding badges:', error);
    throw error;
  }
}

/**
 * Get all badges with user's progress
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Badges with earned status
 */
async function getUserBadges(userId) {
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Badge,
          as: 'badges',
          through: { attributes: ['awarded_at'] },
        },
      ],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get all badges
    const allBadges = await Badge.findAll({
      order: [
        ['rarity', 'DESC'],
        ['condition_value', 'ASC'],
      ],
    });

    // Map badges with earned status
    const userBadgeIds = user.badges.map((b) => b.id);
    const badgesWithStatus = allBadges.map((badge) => {
      const earned = userBadgeIds.includes(badge.id);
      const userBadge = user.badges.find((b) => b.id === badge.id);

      return {
        id: badge.id,
        name: badge.name,
        nameVi: badge.name_vi,
        description: badge.description,
        icon: badge.icon,
        conditionType: badge.condition_type,
        conditionValue: badge.condition_value,
        xpReward: badge.xp_reward,
        rarity: badge.rarity,
        earned,
        awardedAt: earned ? userBadge.user_badges.awarded_at : null,
      };
    });

    return badgesWithStatus;
  } catch (error) {
    console.error('Error getting user badges:', error);
    throw error;
  }
}

/**
 * Get user's badge progress for a specific badge
 * @param {number} userId - User ID
 * @param {number} badgeId - Badge ID
 * @returns {Promise<object>} Badge progress
 */
async function getBadgeProgress(userId, badgeId) {
  try {
    const badge = await Badge.findByPk(badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let currentValue = 0;

    switch (badge.condition_type) {
      case 'words_learned':
        currentValue = user.total_words_learned;
        break;
      case 'streak':
        currentValue = user.streak;
        break;
      case 'lessons_completed':
        currentValue = user.total_lessons_completed;
        break;
      case 'xp':
        currentValue = user.xp;
        break;
      default:
        // For complex conditions, query database
        currentValue = 0;
    }

    const progress = Math.min((currentValue / badge.condition_value) * 100, 100);

    return {
      badgeId: badge.id,
      currentValue,
      targetValue: badge.condition_value,
      progress: Math.round(progress),
      completed: currentValue >= badge.condition_value,
    };
  } catch (error) {
    console.error('Error getting badge progress:', error);
    throw error;
  }
}

module.exports = {
  checkAndAward,
  getUserBadges,
  getBadgeProgress,
};
