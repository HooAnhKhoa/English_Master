/**
 * Spaced Repetition Service - SM-2 Algorithm
 * Based on SuperMemo 2 algorithm for optimal learning intervals
 */

/**
 * Calculate next review schedule using SM-2 algorithm
 * @param {number} quality - User's response quality (0-5)
 *   0: Complete blackout
 *   1: Incorrect response, but correct one remembered
 *   2: Incorrect response, correct one seemed easy to recall
 *   3: Correct response, but required significant difficulty
 *   4: Correct response, after some hesitation
 *   5: Perfect response
 * @param {number} efFactor - Current ease factor (default: 2.5)
 * @param {number} interval - Current interval in days (default: 1)
 * @param {number} repetitions - Number of consecutive correct responses (default: 0)
 * @returns {Object} Next review schedule
 */
function calculateNextReview(quality, efFactor = 2.5, interval = 1, repetitions = 0) {
  // Validate quality (0-5)
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  let nextEfFactor = efFactor;
  let nextInterval = interval;
  let nextRepetitions = repetitions;

  // Calculate new EF (Ease Factor)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEfFactor = efFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // EF should not be less than 1.3
  if (nextEfFactor < 1.3) {
    nextEfFactor = 1.3;
  }

  // Round to 2 decimal places
  nextEfFactor = Math.round(nextEfFactor * 100) / 100;

  // If quality < 3, reset repetitions and interval
  if (quality < 3) {
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    // Correct response
    if (repetitions === 0) {
      nextInterval = 1;
      nextRepetitions = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
      nextRepetitions = 2;
    } else {
      nextInterval = Math.round(interval * nextEfFactor);
      nextRepetitions = repetitions + 1;
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    nextInterval,
    nextEfFactor,
    nextRepetitions,
    nextReviewDate,
  };
}

/**
 * Get quality score from user rating
 * @param {string} rating - User rating: 'forgot', 'hard', 'good', 'easy', 'mastered'
 * @returns {number} Quality score (0-5)
 */
function getQualityFromRating(rating) {
  const ratingMap = {
    forgot: 1,
    hard: 2,
    good: 4,
    easy: 5,
    mastered: 5, // Treat mastered as perfect response
  };

  return ratingMap[rating] || 3;
}

/**
 * Get status based on repetitions and quality
 * @param {number} repetitions - Number of consecutive correct responses
 * @param {number} quality - Quality score
 * @returns {string} Status: 'not-started', 'in-progress', 'completed', 'mastered'
 */
function getStatus(repetitions, quality) {
  if (repetitions === 0 && quality < 3) {
    return 'in-progress';
  }

  if (repetitions >= 5 && quality >= 4) {
    return 'mastered';
  }

  if (repetitions >= 2) {
    return 'completed';
  }

  return 'in-progress';
}

/**
 * Calculate XP reward based on quality and repetitions
 * @param {number} quality - Quality score (0-5)
 * @param {number} repetitions - Number of consecutive correct responses
 * @param {boolean} isNewWord - Whether this is a new word
 * @returns {number} XP reward
 */
function calculateXpReward(quality, repetitions, isNewWord = false) {
  let baseXp = 10;

  // Bonus for new words
  if (isNewWord) {
    baseXp = 20;
  }

  // Quality multiplier
  const qualityMultiplier = {
    0: 0,
    1: 0.5,
    2: 0.7,
    3: 1,
    4: 1.2,
    5: 1.5,
  };

  // Repetition bonus (diminishing returns)
  const repetitionBonus = Math.min(repetitions * 2, 10);

  const totalXp = Math.round(baseXp * (qualityMultiplier[quality] || 1) + repetitionBonus);

  return Math.max(totalXp, 0);
}

/**
 * Get daily quota based on user level
 * @param {string} level - User level: 'beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'
 * @returns {Object} Daily quota { newWords, reviewWords }
 */
function getDailyQuota(level) {
  const quotaMap = {
    beginner: { newWords: 5, reviewWords: 20 },
    elementary: { newWords: 10, reviewWords: 30 },
    intermediate: { newWords: 15, reviewWords: 50 },
    'upper-intermediate': { newWords: 20, reviewWords: 70 },
    advanced: { newWords: 25, reviewWords: 100 },
  };

  return quotaMap[level] || quotaMap.beginner;
}

module.exports = {
  calculateNextReview,
  getQualityFromRating,
  getStatus,
  calculateXpReward,
  getDailyQuota,
};
