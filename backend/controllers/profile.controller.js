const { User, UserProgress, Quiz, ReviewHistory, Badge, UserBadge, Vocabulary, Lesson, Video, Topic } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs').promises;

/**
 * GET /api/user/profile
 * Get user profile with learning overview
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user info
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get total study time from review history
  const totalStudyMinutes = await ReviewHistory.sum('time_spent_minutes', {
    where: { user_id: userId }
  }) || 0;

  // Get total AI conversations (if you have this feature)
  const totalAiConversations = 0; // TODO: implement when AI chat is ready

  // Get longest streak
  const longestStreak = user.longest_streak || user.streak;

  // Get average quiz accuracy
  const quizStats = await Quiz.findAll({
    where: { user_id: userId, status: 'completed' },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('score')), 'avgScore'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalQuizzes']
    ],
    raw: true
  });

  const averageAccuracy = quizStats[0]?.avgScore ? parseFloat(quizStats[0].avgScore).toFixed(2) : 0;

  // Get rank position (weekly XP ranking)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyXP = await ReviewHistory.sum('xp_earned', {
    where: {
      user_id: userId,
      review_date: { [Op.gte]: weekAgo }
    }
  }) || 0;

  const usersWithMoreXP = await User.count({
    where: {
      is_active: true,
      id: { [Op.ne]: userId }
    },
    include: [{
      model: ReviewHistory,
      as: 'reviewHistory',
      where: { review_date: { [Op.gte]: weekAgo } },
      attributes: [],
      required: false
    }],
    having: sequelize.literal(`SUM(COALESCE(\`reviewHistory\`.\`xp_earned\`, 0)) > ${weeklyXP}`)
  });

  const rankPosition = usersWithMoreXP + 1;

  // Calculate XP to next level
  const levelXPMap = {
    1: 0, 2: 100, 3: 250, 4: 500, 5: 1000,
    6: 1500, 7: 2000, 8: 3000, 9: 4000, 10: 5000
  };
  const currentLevel = user.level || 1;
  const nextLevel = currentLevel + 1;
  const xpToNextLevel = levelXPMap[nextLevel] ? levelXPMap[nextLevel] - user.xp : 0;

  // Get recent badges (5 most recent)
  const recentBadges = await UserBadge.findAll({
    where: { user_id: userId },
    include: [{
      model: Badge,
      as: 'badge',
      attributes: ['id', 'name', 'description', 'icon', 'rarity']
    }],
    order: [['awarded_at', 'DESC']],
    limit: 5
  });

  // Get total videos completed
  const totalVideosCompleted = await UserProgress.count({
    where: {
      user_id: userId,
      type: 'video',
      status: 'completed'
    }
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        streak: user.streak,
        createdAt: user.created_at
      },
      stats: {
        totalWordsLearned: user.total_words_learned || 0,
        totalLessonsCompleted: user.total_lessons_completed || 0,
        totalVideosCompleted,
        totalAiConversations,
        totalStudyMinutes: Math.round(totalStudyMinutes),
        currentStreak: user.streak || 0,
        longestStreak,
        averageAccuracy: parseFloat(averageAccuracy),
        rankPosition,
        xpToNextLevel
      },
      recentBadges: recentBadges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        rarity: ub.badge.rarity,
        earnedAt: ub.awarded_at
      })),
      levelProgress: {
        currentLevel,
        currentXP: user.xp,
        xpRequired: levelXPMap[nextLevel] || 0,
        percentage: levelXPMap[nextLevel] ? ((user.xp / levelXPMap[nextLevel]) * 100).toFixed(2) : 100
      }
    }
  });
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { fullName, username, avatar } = req.body;

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if username is unique (exclude current user)
  if (username && username !== user.username) {
    const existingUser = await User.findOne({
      where: {
        username,
        id: { [Op.ne]: userId }
      }
    });

    if (existingUser) {
      throw new ApiError(409, 'Username already taken');
    }
  }

  // Update fields
  if (fullName !== undefined) user.full_name = fullName;
  if (username !== undefined) user.username = username;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  const userResponse = user.toJSON();
  delete userResponse.password;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: userResponse }
  });
});

/**
 * POST /api/user/avatar
 * Upload avatar to Cloudinary
 */
exports.uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  try {
    // Check if Cloudinary is configured
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
                                  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

    let avatarUrl;

    if (cloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.path, 'englishmaster/avatars', 'image');

      // Delete old avatar from Cloudinary if exists
      if (user.avatar && user.avatar.includes('cloudinary')) {
        const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(publicId, 'image').catch(() => {});
      }

      avatarUrl = result.url;

      // Delete local file after uploading to Cloudinary
      await fs.unlink(req.file.path);
    } else {
      // Use local storage
      // Delete old avatar file if exists (local file only)
      if (user.avatar && !user.avatar.includes('cloudinary') && !user.avatar.includes('http')) {
        const oldAvatarPath = require('path').join(__dirname, '..', user.avatar);
        await fs.unlink(oldAvatarPath).catch(() => {});
      }

      // Generate avatar URL (relative path)
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    // Update user avatar
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl: user.avatar }
    });
  } catch (error) {
    // Delete local file on error
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

/**
 * PUT /api/user/change-password
 * Change user password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'New password and confirm password do not match');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

/**
 * GET /api/user/stats/detail
 * Get detailed statistics
 */
exports.getDetailedStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Vocabulary stats
  const vocabProgress = await UserProgress.findAll({
    where: {
      user_id: userId,
      type: 'vocabulary'
    },
    include: [{
      model: Vocabulary,
      as: 'vocabulary',
      attributes: ['level', 'topic_id'],
      include: [{
        model: Topic,
        as: 'topic',
        attributes: ['id', 'name', 'name_vi']
      }]
    }]
  });

  const vocabByStatus = {
    total: vocabProgress.length,
    mastered: vocabProgress.filter(p => p.status === 'mastered').length,
    inProgress: vocabProgress.filter(p => p.status === 'in-progress').length,
    completed: vocabProgress.filter(p => p.status === 'completed').length,
    notStarted: 0
  };

  // By level
  const vocabByLevel = {};
  ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(level => {
    vocabByLevel[level] = vocabProgress.filter(p => p.vocabulary?.level === level).length;
  });

  // By topic
  const topicMap = {};
  vocabProgress.forEach(p => {
    if (p.vocabulary?.topic) {
      const topicId = p.vocabulary.topic.id;
      if (!topicMap[topicId]) {
        topicMap[topicId] = {
          topicName: p.vocabulary.topic.name_vi || p.vocabulary.topic.name,
          learned: 0,
          total: 0
        };
      }
      topicMap[topicId].learned++;
    }
  });

  // Get total vocab per topic
  const allTopics = await Topic.findAll({
    attributes: [
      'id',
      'name',
      'name_vi',
      [sequelize.fn('COUNT', sequelize.col('vocabularies.id')), 'total']
    ],
    include: [{
      model: Vocabulary,
      as: 'vocabularies',
      attributes: [],
      required: false
    }],
    group: ['Topic.id']
  });

  allTopics.forEach(topic => {
    const topicId = topic.id;
    if (topicMap[topicId]) {
      topicMap[topicId].total = parseInt(topic.dataValues.total) || 0;
    }
  });

  const vocabByTopic = Object.values(topicMap);

  // Lesson stats
  const lessonProgress = await UserProgress.findAll({
    where: {
      user_id: userId,
      type: 'lesson'
    },
    include: [{
      model: Lesson,
      as: 'lesson',
      attributes: ['category']
    }]
  });

  const lessonsByCategory = {};
  lessonProgress.forEach(p => {
    const category = p.lesson?.category || 'other';
    lessonsByCategory[category] = (lessonsByCategory[category] || 0) + 1;
  });

  const avgLessonScore = lessonProgress.length > 0
    ? (lessonProgress.reduce((sum, p) => sum + (p.score || 0), 0) / lessonProgress.length).toFixed(2)
    : 0;

  // Streak stats
  const user = await User.findByPk(userId);
  const totalDaysStudied = await ReviewHistory.count({
    where: { user_id: userId },
    distinct: true,
    col: 'review_date'
  });

  // Quiz history
  const quizzes = await Quiz.findAll({
    where: {
      user_id: userId,
      status: 'completed'
    },
    attributes: ['score'],
    order: [['score', 'DESC']],
    limit: 1
  });

  const totalQuizzes = await Quiz.count({
    where: { user_id: userId, status: 'completed' }
  });

  const avgQuizScore = await Quiz.findAll({
    where: { user_id: userId, status: 'completed' },
    attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avg']],
    raw: true
  });

  // Activity last 7 and 30 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const last30Days = getLast30Days();

  const activityLast7 = await ReviewHistory.findAll({
    where: {
      user_id: userId,
      review_date: { [Op.in]: last7Days }
    },
    attributes: ['review_date', 'xp_earned', 'words_reviewed'],
    raw: true
  });

  const activityLast30 = await ReviewHistory.findAll({
    where: {
      user_id: userId,
      review_date: { [Op.in]: last30Days }
    },
    attributes: ['review_date', 'xp_earned', 'words_reviewed'],
    raw: true
  });

  const activityMap7 = {};
  activityLast7.forEach(a => {
    activityMap7[a.review_date] = { xp: a.xp_earned, words: a.words_reviewed };
  });

  const activityMap30 = {};
  activityLast30.forEach(a => {
    activityMap30[a.review_date] = { xp: a.xp_earned, words: a.words_reviewed };
  });

  const activity7 = last7Days.map(date => ({
    date,
    xp: activityMap7[date]?.xp || 0,
    words: activityMap7[date]?.words || 0
  }));

  const activity30 = last30Days.map(date => ({
    date,
    xp: activityMap30[date]?.xp || 0,
    words: activityMap30[date]?.words || 0
  }));

  res.json({
    success: true,
    data: {
      vocabulary: {
        total: vocabByStatus.total,
        mastered: vocabByStatus.mastered,
        inProgress: vocabByStatus.inProgress,
        completed: vocabByStatus.completed,
        notStarted: vocabByStatus.notStarted,
        byLevel: vocabByLevel,
        byTopic: vocabByTopic
      },
      lessons: {
        completed: lessonProgress.filter(p => p.status === 'completed').length,
        inProgress: lessonProgress.filter(p => p.status === 'in-progress').length,
        averageScore: parseFloat(avgLessonScore),
        byCategory: lessonsByCategory
      },
      streak: {
        current: user.streak || 0,
        longest: user.longest_streak || user.streak || 0,
        totalDaysStudied
      },
      quizHistory: {
        totalQuizzes,
        averageScore: avgQuizScore[0]?.avg ? parseFloat(avgQuizScore[0].avg).toFixed(2) : 0,
        bestScore: quizzes[0]?.score || 0
      },
      activity: {
        last7days: activity7,
        last30days: activity30
      }
    }
  });
});

/**
 * GET /api/user/activity-feed
 * Get recent activity feed
 */
exports.getActivityFeed = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Get recent activities from multiple sources
  const activities = [];

  // Recent quizzes
  const recentQuizzes = await Quiz.findAll({
    where: {
      user_id: userId,
      status: 'completed'
    },
    order: [['completed_at', 'DESC']],
    limit: 10,
    attributes: ['id', 'score', 'xp_earned', 'completed_at']
  });

  recentQuizzes.forEach(quiz => {
    activities.push({
      type: 'quiz_done',
      description: `Hoàn thành quiz với điểm ${quiz.score}%`,
      xpEarned: quiz.xp_earned,
      createdAt: quiz.completed_at
    });
  });

  // Recent badges
  const recentBadges = await UserBadge.findAll({
    where: { user_id: userId },
    include: [{
      model: Badge,
      as: 'badge',
      attributes: ['name', 'icon']
    }],
    order: [['awarded_at', 'DESC']],
    limit: 10
  });

  recentBadges.forEach(ub => {
    activities.push({
      type: 'badge_earned',
      description: `Đạt huy hiệu "${ub.badge.name}"`,
      xpEarned: 50,
      createdAt: ub.awarded_at,
      icon: ub.badge.icon
    });
  });

  // Recent lessons completed
  const recentLessons = await UserProgress.findAll({
    where: {
      user_id: userId,
      type: 'lesson',
      status: 'completed'
    },
    include: [{
      model: Lesson,
      as: 'lesson',
      attributes: ['title']
    }],
    order: [['updated_at', 'DESC']],
    limit: 10
  });

  recentLessons.forEach(progress => {
    activities.push({
      type: 'lesson_completed',
      description: `Hoàn thành bài học "${progress.lesson?.title || 'Untitled'}"`,
      xpEarned: 20,
      createdAt: progress.updated_at
    });
  });

  // Sort by date and paginate
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const paginatedActivities = activities.slice(offset, offset + parseInt(limit));

  res.json({
    success: true,
    data: paginatedActivities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: activities.length,
      hasMore: offset + parseInt(limit) < activities.length
    }
  });
});

/**
 * DELETE /api/user/account
 * Delete user account (soft delete)
 */
exports.deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { password, reason } = req.body;

  if (!password) {
    throw new ApiError(400, 'Password is required to delete account');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, 'Password is incorrect');
  }

  // Soft delete
  user.is_active = false;
  user.deleted_reason = reason || null;
  user.deleted_at = new Date();
  await user.save();

  // TODO: Send confirmation email

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * GET /api/user/check-username
 * Check if username is available
 */
exports.checkUsernameAvailable = asyncHandler(async (req, res) => {
  const { username } = req.query;
  const userId = req.user.id;

  if (!username) {
    throw new ApiError(400, 'Username is required');
  }

  const existingUser = await User.findOne({
    where: {
      username,
      id: { [Op.ne]: userId }
    }
  });

  res.json({
    success: true,
    available: !existingUser
  });
});

module.exports = exports;
