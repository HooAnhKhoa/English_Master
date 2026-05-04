const { UserProgress, User, Lesson, Vocabulary } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Get user progress
 * @route   GET /api/v1/progress
 * @access  Private
 */
const getUserProgress = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  // Build where clause
  const where = { user_id: userId };

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  // Calculate pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Fetch progress
  const { count, rows: progress } = await UserProgress.findAndCountAll({
    where,
    order: [['last_studied', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    data: progress,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get progress for specific item
 * @route   GET /api/v1/progress/:type/:refId
 * @access  Private
 */
const getItemProgress = asyncHandler(async (req, res) => {
  const { type, refId } = req.params;
  const userId = req.user.id;

  const progress = await UserProgress.findOne({
    where: {
      user_id: userId,
      type,
      ref_id: refId,
    },
  });

  if (!progress) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No progress found for this item',
    });
  }

  res.status(200).json({
    success: true,
    data: progress,
  });
});

/**
 * @desc    Update or create progress
 * @route   POST /api/v1/progress
 * @access  Private
 */
const updateProgress = asyncHandler(async (req, res) => {
  const { type, ref_id, status, score, quality } = req.body;
  const userId = req.user.id;

  if (!type || !ref_id) {
    throw new ApiError(400, 'Type and ref_id are required');
  }

  // Find or create progress
  let [progress, created] = await UserProgress.findOrCreate({
    where: {
      user_id: userId,
      type,
      ref_id,
    },
    defaults: {
      status: status || 'in-progress',
      score,
      attempts: 1,
      last_studied: new Date(),
    },
  });

  if (!created) {
    // Update existing progress
    progress.attempts += 1;
    progress.last_studied = new Date();

    if (status) {
      progress.status = status;
    }

    if (score !== undefined) {
      progress.score = score;
    }

    // Update spaced repetition based on quality (0-5)
    if (quality !== undefined) {
      progress = updateSpacedRepetition(progress, quality);
    }

    await progress.save();
  }

  // Update user statistics
  const user = await User.findByPk(userId);

  if (status === 'completed' || status === 'mastered') {
    if (type === 'lesson') {
      user.total_lessons_completed += 1;
      user.xp += 50; // XP for completing lesson
    } else if (type === 'vocabulary') {
      user.total_words_learned += 1;
      user.xp += 10; // XP for learning word
    }
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: created ? 'Progress created successfully' : 'Progress updated successfully',
    data: progress,
  });
});

/**
 * @desc    Get items due for review (Spaced Repetition)
 * @route   GET /api/v1/progress/review
 * @access  Private
 */
const getReviewItems = asyncHandler(async (req, res) => {
  const { type, limit = 20 } = req.query;
  const userId = req.user.id;

  const where = {
    user_id: userId,
    next_review: {
      [Op.lte]: new Date(),
    },
    status: {
      [Op.in]: ['in-progress', 'completed'],
    },
  };

  if (type) {
    where.type = type;
  }

  const reviewItems = await UserProgress.findAll({
    where,
    order: [['next_review', 'ASC']],
    limit: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    data: reviewItems,
    count: reviewItems.length,
  });
});

/**
 * @desc    Get user statistics summary
 * @route   GET /api/v1/progress/stats
 * @access  Private
 */
const getProgressStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await UserProgress.findAll({
    where: { user_id: userId },
    attributes: [
      'type',
      'status',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
    ],
    group: ['type', 'status'],
  });

  // Format stats
  const formattedStats = {
    lesson: { 'not-started': 0, 'in-progress': 0, completed: 0, mastered: 0 },
    vocabulary: { 'not-started': 0, 'in-progress': 0, completed: 0, mastered: 0 },
    topic: { 'not-started': 0, 'in-progress': 0, completed: 0, mastered: 0 },
  };

  stats.forEach((stat) => {
    const statData = stat.toJSON();
    formattedStats[statData.type][statData.status] = parseInt(statData.count);
  });

  res.status(200).json({
    success: true,
    data: formattedStats,
  });
});

/**
 * Helper function: Update spaced repetition algorithm (SM-2)
 * @param {object} progress - Progress object
 * @param {number} quality - Quality rating (0-5)
 * @returns {object} Updated progress object
 */
function updateSpacedRepetition(progress, quality) {
  // SM-2 Algorithm
  if (quality >= 3) {
    // Correct response
    if (progress.repetitions === 0) {
      progress.interval_days = 1;
    } else if (progress.repetitions === 1) {
      progress.interval_days = 6;
    } else {
      progress.interval_days = Math.round(progress.interval_days * progress.ef_factor);
    }
    progress.repetitions += 1;
  } else {
    // Incorrect response
    progress.repetitions = 0;
    progress.interval_days = 1;
  }

  // Update ease factor
  progress.ef_factor = Math.max(
    1.3,
    progress.ef_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Set next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + progress.interval_days);
  progress.next_review = nextReview;

  // Update status based on repetitions
  if (progress.repetitions >= 5) {
    progress.status = 'mastered';
  } else if (progress.repetitions > 0) {
    progress.status = 'completed';
  }

  return progress;
}

module.exports = {
  getUserProgress,
  getItemProgress,
  updateProgress,
  getReviewItems,
  getProgressStats,
};
