const { Op } = require('sequelize');
const { Vocabulary, UserProgress, User, Topic, sequelize } = require('../models');
const {
  calculateNextReview,
  getQualityFromRating,
  getStatus,
  calculateXpReward,
  getDailyQuota,
} = require('../services/spacedRepetition');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all topics with word count and user progress
 * GET /api/v1/vocab/topics
 */
exports.getAllTopics = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get all active topics with word count
    const topics = await Topic.findAll({
      where: { is_active: true },
      attributes: [
        'id',
        'name',
        'name_vi',
        'icon',
        'slug',
        'description',
        [sequelize.fn('COUNT', sequelize.col('vocabularies.id')), 'word_count'],
      ],
      include: [
        {
          model: Vocabulary,
          as: 'vocabularies',
          attributes: [],
          required: false,
        },
      ],
      group: ['Topic.id'],
      order: [['name', 'ASC']],
    });

    // If user is logged in, get their progress for each topic
    const topicsWithProgress = await Promise.all(
      topics.map(async (topic) => {
        const topicData = topic.toJSON();

        if (userId) {
          // Get learned word count for this topic
          const learnedCount = await UserProgress.count({
            where: {
              user_id: userId,
              type: 'vocabulary',
              status: {
                [Op.in]: ['in-progress', 'completed', 'mastered'],
              },
            },
            include: [
              {
                model: Vocabulary,
                as: 'vocabulary',
                where: { topic_id: topic.id },
                attributes: [],
              },
            ],
          });

          topicData.learnedCount = learnedCount;
          topicData.progress =
            topicData.word_count > 0
              ? Math.round((learnedCount / topicData.word_count) * 100)
              : 0;
        } else {
          topicData.learnedCount = 0;
          topicData.progress = 0;
        }

        return topicData;
      })
    );

    res.status(200).json({
      success: true,
      data: topicsWithProgress,
    });
  } catch (error) {
    console.error('Get all topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get topic detail with vocabulary list
 * GET /api/v1/vocab/topics/:slug
 */
exports.getTopicBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user?.id;

    // Find topic
    const topic = await Topic.findOne({
      where: { slug, is_active: true },
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    // Build where clause for vocabularies
    const vocabWhere = { topic_id: topic.id, is_active: true };

    // Get vocabularies with pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let vocabularies = await Vocabulary.findAndCountAll({
      where: vocabWhere,
      limit: parseInt(limit),
      offset,
      order: [['word', 'ASC']],
      attributes: [
        'id',
        'word',
        'pronunciation',
        'meaning',
        'part_of_speech',
        'image_url',
        'level',
      ],
    });

    // If user is logged in, get their progress for each word
    if (userId) {
      const vocabIds = vocabularies.rows.map((v) => v.id);

      const userProgressMap = await UserProgress.findAll({
        where: {
          user_id: userId,
          type: 'vocabulary',
          ref_id: {
            [Op.in]: vocabIds,
          },
        },
      }).then((progressList) => {
        const map = {};
        progressList.forEach((p) => {
          map[p.ref_id] = {
            status: p.status,
            nextReview: p.next_review,
            repetitions: p.repetitions,
            easeFactor: p.ef_factor,
          };
        });
        return map;
      });

      vocabularies.rows = vocabularies.rows.map((vocab) => {
        const vocabData = vocab.toJSON();
        vocabData.userProgress = userProgressMap[vocab.id] || {
          status: 'not-started',
          nextReview: null,
          repetitions: 0,
          easeFactor: 2.5,
        };
        return vocabData;
      });

      // Filter by status if requested
      if (status) {
        vocabularies.rows = vocabularies.rows.filter(
          (v) => v.userProgress.status === status
        );
        vocabularies.count = vocabularies.rows.length;
      }
    } else {
      // No user logged in, all words are not-started
      vocabularies.rows = vocabularies.rows.map((vocab) => {
        const vocabData = vocab.toJSON();
        vocabData.userProgress = {
          status: 'not-started',
          nextReview: null,
          repetitions: 0,
          easeFactor: 2.5,
        };
        return vocabData;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        topic: {
          id: topic.id,
          name: topic.name,
          nameVi: topic.name_vi,
          icon: topic.icon,
          slug: topic.slug,
          description: topic.description,
        },
        words: vocabularies.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: vocabularies.count,
          totalPages: Math.ceil(vocabularies.count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get topic by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get vocabulary detail by ID
 * GET /api/v1/vocab/:id
 */
exports.getVocabById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get vocabulary
    const vocab = await Vocabulary.findByPk(id, {
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi', 'slug'],
        },
      ],
    });

    if (!vocab) {
      return res.status(404).json({
        success: false,
        message: 'Vocabulary not found',
      });
    }

    const vocabData = vocab.toJSON();

    // Get user progress if logged in
    if (userId) {
      const userProgress = await UserProgress.findOne({
        where: {
          user_id: userId,
          type: 'vocabulary',
          ref_id: id,
        },
      });

      vocabData.userProgress = userProgress
        ? {
            status: userProgress.status,
            nextReview: userProgress.next_review,
            repetitions: userProgress.repetitions,
            easeFactor: userProgress.ef_factor,
            lastReviewed: userProgress.last_studied,
          }
        : {
            status: 'not-started',
            nextReview: null,
            repetitions: 0,
            easeFactor: 2.5,
            lastReviewed: null,
          };
    } else {
      vocabData.userProgress = {
        status: 'not-started',
        nextReview: null,
        repetitions: 0,
        easeFactor: 2.5,
        lastReviewed: null,
      };
    }

    // Get related words (5 random words from same topic)
    const relatedWords = await Vocabulary.findAll({
      where: {
        topic_id: vocab.topic_id,
        id: { [Op.ne]: id },
        is_active: true,
      },
      limit: 5,
      order: sequelize.random(),
      attributes: ['id', 'word', 'pronunciation', 'meaning', 'image_url'],
    });

    vocabData.relatedWords = relatedWords;

    res.status(200).json({
      success: true,
      data: vocabData,
    });
  } catch (error) {
    console.error('Get vocab by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Search vocabulary
 * GET /api/v1/vocab/search
 */
exports.searchVocabulary = async (req, res) => {
  try {
    const { q, level, topic, page = 1, limit = 20 } = req.query;
    const userId = req.user?.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    // Build where clause
    const where = { is_active: true };

    // Search in word, meaning, or definition
    where[Op.or] = [
      { word: { [Op.like]: `%${q}%` } },
      { meaning: { [Op.like]: `%${q}%` } },
      { definition: { [Op.like]: `%${q}%` } },
    ];

    // Filter by level
    if (level) {
      where.level = level;
    }

    // Filter by topic
    if (topic) {
      where.topic_id = topic;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Search vocabularies
    const results = await Vocabulary.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi', 'slug', 'icon'],
        },
      ],
      order: [['word', 'ASC']],
    });

    // Get user progress if logged in
    if (userId) {
      const vocabIds = results.rows.map((v) => v.id);

      const userProgressMap = await UserProgress.findAll({
        where: {
          user_id: userId,
          type: 'vocabulary',
          ref_id: { [Op.in]: vocabIds },
        },
      }).then((progressList) => {
        const map = {};
        progressList.forEach((p) => {
          map[p.ref_id] = {
            status: p.status,
            nextReview: p.next_review,
            repetitions: p.repetitions,
          };
        });
        return map;
      });

      results.rows = results.rows.map((vocab) => {
        const vocabData = vocab.toJSON();
        vocabData.userProgress = userProgressMap[vocab.id] || {
          status: 'not-started',
          nextReview: null,
          repetitions: 0,
        };
        return vocabData;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        results: results.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.count,
          totalPages: Math.ceil(results.count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Search vocabulary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Start learning vocabulary
 * POST /api/v1/vocab/start-learning
 */
exports.startLearning = async (req, res) => {
  try {
    const { topicId, vocabIds } = req.body;
    const userId = req.user.id;

    let vocabularyIds = [];

    // Get vocabulary IDs based on input
    if (topicId) {
      // Get all vocabularies in topic
      const vocabs = await Vocabulary.findAll({
        where: { topic_id: topicId, is_active: true },
        attributes: ['id'],
      });
      vocabularyIds = vocabs.map((v) => v.id);
    } else if (vocabIds && Array.isArray(vocabIds)) {
      vocabularyIds = vocabIds;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either topicId or vocabIds is required',
      });
    }

    if (vocabularyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No vocabularies found',
      });
    }

    // Check which vocabularies user already has progress for
    const existingProgress = await UserProgress.findAll({
      where: {
        user_id: userId,
        type: 'vocabulary',
        ref_id: { [Op.in]: vocabularyIds },
      },
      attributes: ['ref_id'],
    });

    const existingVocabIds = existingProgress.map((p) => p.ref_id);
    const newVocabIds = vocabularyIds.filter((id) => !existingVocabIds.includes(id));

    // Create progress records for new vocabularies
    if (newVocabIds.length > 0) {
      const progressRecords = newVocabIds.map((vocabId) => ({
        user_id: userId,
        type: 'vocabulary',
        ref_id: vocabId,
        status: 'in-progress',
        repetitions: 0,
        ef_factor: 2.5,
        interval_days: 0,
        next_review: new Date(),
      }));

      await UserProgress.bulkCreate(progressRecords);
    }

    res.status(200).json({
      success: true,
      message: 'Started learning vocabulary',
      data: {
        started: newVocabIds.length,
        alreadyLearning: existingVocabIds.length,
        total: vocabularyIds.length,
      },
    });
  } catch (error) {
    console.error('Start learning error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get today's vocabulary review list
 * GET /api/v1/vocab/today
 */
exports.getTodayVocab = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const now = new Date();
    const quota = getDailyQuota(user.level);

    // Get words due for review today (exclude mastered words)
    const dueReviews = await UserProgress.findAll({
      where: {
        user_id: userId,
        type: 'vocabulary',
        next_review: {
          [Op.lte]: now,
        },
        status: {
          [Op.notIn]: ['mastered', 'not-started'],
        },
      },
      include: [
        {
          model: Vocabulary,
          as: 'vocabulary',
          include: [
            {
              model: Topic,
              as: 'topic',
              attributes: ['id', 'name', 'name_vi', 'icon'],
            },
          ],
        },
      ],
      limit: quota.reviewWords,
      order: [['next_review', 'ASC']],
    });

    // Get new words to learn (not started yet)
    const learnedTodayCount = await UserProgress.count({
      where: {
        user_id: userId,
        type: 'vocabulary',
        status: 'in-progress',
        created_at: {
          [Op.gte]: new Date(now.setHours(0, 0, 0, 0)),
        },
      },
    });

    const newWordsQuota = Math.max(0, quota.newWords - learnedTodayCount);

    let newWords = [];
    if (newWordsQuota > 0) {
      // Get vocabularies that user hasn't started yet
      const learnedVocabIds = await UserProgress.findAll({
        where: {
          user_id: userId,
          type: 'vocabulary',
        },
        attributes: ['ref_id'],
        raw: true,
      }).then((results) => results.map((r) => r.ref_id));

      newWords = await Vocabulary.findAll({
        where: {
          id: {
            [Op.notIn]: learnedVocabIds.length > 0 ? learnedVocabIds : [0],
          },
          level: {
            [Op.in]: getLevelRange(user.level),
          },
          is_active: true,
        },
        include: [
          {
            model: Topic,
            as: 'topic',
            attributes: ['id', 'name', 'name_vi', 'icon'],
          },
        ],
        limit: newWordsQuota,
        order: [['created_at', 'ASC']],
      });
    }

    // Calculate today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayStats = {
      reviewed: await UserProgress.count({
        where: {
          user_id: userId,
          type: 'vocabulary',
          updated_at: {
            [Op.gte]: todayStart,
          },
          last_studied: {
            [Op.gte]: todayStart,
          },
        },
      }),
      newLearned: learnedTodayCount,
      dueCount: dueReviews.length,
      newAvailable: newWords.length,
      quota: quota,
      streak: user.streak,
      xp: user.xp,
    };

    res.json({
      success: true,
      data: {
        toReview: dueReviews.map((progress) => ({
          progressId: progress.id,
          vocab: progress.vocabulary,
          lastStudied: progress.last_studied,
          attempts: progress.attempts,
          status: progress.status,
        })),
        newWords: newWords,
        todayStats: todayStats,
      },
    });
  } catch (error) {
    console.error('Get today vocab error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Review a flashcard
 * POST /api/v1/vocab/flashcard/review
 */
exports.reviewFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vocabId, quality, responseTimeMs } = req.body;

    // Validate input
    if (!vocabId) {
      return res.status(400).json({
        success: false,
        message: 'Vocabulary ID is required',
      });
    }

    // Convert rating to quality if needed
    let qualityScore = quality;
    if (typeof quality === 'string') {
      qualityScore = getQualityFromRating(quality);
    }

    if (qualityScore < 0 || qualityScore > 5) {
      return res.status(400).json({
        success: false,
        message: 'Quality must be between 0 and 5, or one of: forgot, hard, good, easy, mastered',
      });
    }

    // Check if vocabulary exists
    const vocab = await Vocabulary.findByPk(vocabId);
    if (!vocab) {
      return res.status(404).json({
        success: false,
        message: 'Vocabulary not found',
      });
    }

    // Get or create user progress
    let progress = await UserProgress.findOne({
      where: {
        user_id: userId,
        type: 'vocabulary',
        ref_id: vocabId,
      },
    });

    const isNewWord = !progress;

    if (!progress) {
      progress = await UserProgress.create({
        user_id: userId,
        type: 'vocabulary',
        ref_id: vocabId,
        status: 'in-progress',
        ef_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        attempts: 0,
      });
    }

    // If user marked as mastered, set status directly
    let newStatus;
    let nextReview;
    let newScore;

    if (quality === 'mastered') {
      // Mark as mastered immediately
      newStatus = 'mastered';
      newScore = 100;

      // Set next review to far future (1 year)
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 1);

      await progress.update({
        status: newStatus,
        score: newScore,
        attempts: progress.attempts + 1,
        last_studied: new Date(),
        next_review: farFuture,
        ef_factor: 2.5,
        interval_days: 365,
        repetitions: 10, // High repetition count to indicate mastery
      });

      nextReview = {
        nextReviewDate: farFuture,
        nextInterval: 365,
        nextRepetitions: 10,
        nextEfFactor: 2.5,
      };
    } else {
      // Calculate next review using SM-2 algorithm
      nextReview = calculateNextReview(
        qualityScore,
        progress.ef_factor,
        progress.interval_days,
        progress.repetitions
      );

      // Update progress
      newStatus = getStatus(nextReview.nextRepetitions, qualityScore);
      newScore = qualityScore >= 3 ? Math.min(100, (progress.score || 0) + 10) : Math.max(0, (progress.score || 0) - 10);

      await progress.update({
        status: newStatus,
        score: newScore,
        attempts: progress.attempts + 1,
        last_studied: new Date(),
        next_review: nextReview.nextReviewDate,
        ef_factor: nextReview.nextEfFactor,
        interval_days: nextReview.nextInterval,
        repetitions: nextReview.nextRepetitions,
      });
    }

    // Calculate XP reward
    const xpEarned = calculateXpReward(qualityScore, nextReview.nextRepetitions, isNewWord);

    // Update user stats
    const user = await User.findByPk(userId);
    const oldLevel = user.level;
    const oldXp = user.xp;

    await user.update({
      xp: user.xp + xpEarned,
      coins: user.coins + Math.floor(xpEarned / 2),
      total_words_learned: isNewWord ? user.total_words_learned + 1 : user.total_words_learned,
    });

    // Check for level up
    const levelUp = checkLevelUp(oldXp, user.xp, oldLevel);

    if (levelUp.leveled) {
      await user.update({ level: levelUp.newLevel });
    }

    // Check for new badges
    const newBadge = await checkAndAwardBadges(user);

    res.json({
      success: true,
      message: 'Review recorded successfully',
      data: {
        progress: {
          status: newStatus,
          score: newScore,
          nextReview: nextReview.nextReviewDate,
          intervalDays: nextReview.nextInterval,
          repetitions: nextReview.nextRepetitions,
        },
        xpEarned,
        totalXp: user.xp,
        coinsEarned: Math.floor(xpEarned / 2),
        totalCoins: user.coins,
        levelUp: levelUp.leveled ? levelUp : null,
        newBadge: newBadge || null,
        isNewWord,
      },
    });
  } catch (error) {
    console.error('Review flashcard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get vocabulary statistics
 * GET /api/v1/vocab/stats
 */
exports.getVocabStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = {
      total: await UserProgress.count({
        where: { user_id: userId, type: 'vocabulary' },
      }),
      notStarted: await Vocabulary.count({
        where: {
          id: {
            [Op.notIn]: await UserProgress.findAll({
              where: { user_id: userId, type: 'vocabulary' },
              attributes: ['ref_id'],
              raw: true,
            }).then((r) => r.map((p) => p.ref_id)),
          },
        },
      }),
      inProgress: await UserProgress.count({
        where: { user_id: userId, type: 'vocabulary', status: 'in-progress' },
      }),
      completed: await UserProgress.count({
        where: { user_id: userId, type: 'vocabulary', status: 'completed' },
      }),
      mastered: await UserProgress.count({
        where: { user_id: userId, type: 'vocabulary', status: 'mastered' },
      }),
      dueToday: await UserProgress.count({
        where: {
          user_id: userId,
          type: 'vocabulary',
          next_review: { [Op.lte]: new Date() },
        },
      }),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get vocab stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Helper functions

/**
 * Get level range for vocabulary selection
 */
function getLevelRange(userLevel) {
  const levelMap = {
    beginner: ['A1'],
    elementary: ['A1', 'A2'],
    intermediate: ['A2', 'B1'],
    'upper-intermediate': ['B1', 'B2'],
    advanced: ['B2', 'C1', 'C2'],
  };

  return levelMap[userLevel] || ['A1'];
}

/**
 * Check if user leveled up
 */
function checkLevelUp(oldXp, newXp, currentLevel) {
  const levelThresholds = {
    beginner: 0,
    elementary: 500,
    intermediate: 1500,
    'upper-intermediate': 3000,
    advanced: 5000,
  };

  const levels = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
  const currentIndex = levels.indexOf(currentLevel);

  for (let i = currentIndex + 1; i < levels.length; i++) {
    const threshold = levelThresholds[levels[i]];
    if (oldXp < threshold && newXp >= threshold) {
      return {
        leveled: true,
        newLevel: levels[i],
        threshold,
      };
    }
  }

  return { leveled: false };
}

/**
 * Check and award badges
 */
async function checkAndAwardBadges(user) {
  const { Badge } = require('../models');

  // Check for word learning badges
  const wordBadges = await Badge.findAll({
    where: {
      condition_type: 'words_learned',
      condition_value: { [Op.lte]: user.total_words_learned },
    },
  });

  for (const badge of wordBadges) {
    const hasBadge = await user.hasBadge(badge);
    if (!hasBadge) {
      await user.addBadge(badge);
      await user.update({ xp: user.xp + badge.xp_reward });
      return badge;
    }
  }

  return null;
}

module.exports = exports;
