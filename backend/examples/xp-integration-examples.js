// Example: Integrating XP system into vocabulary learning

const { asyncHandler } = require('../middleware/errorHandler');
const { Vocabulary, UserProgress } = require('../models');
const xpService = require('../services/xpService');

/**
 * Example: Mark vocabulary as learned and award XP
 */
const markVocabularyAsLearned = asyncHandler(async (req, res) => {
  const { vocabId } = req.params;
  const userId = req.user.id;

  // Check if this is the first word of the day
  const today = new Date().toISOString().split('T')[0];
  const todayProgress = await UserProgress.findOne({
    where: {
      user_id: userId,
      type: 'vocabulary',
      created_at: {
        [sequelize.Sequelize.Op.gte]: `${today} 00:00:00`,
      },
    },
  });

  const isFirstWordOfDay = !todayProgress;

  // Mark vocabulary as learned
  await UserProgress.create({
    user_id: userId,
    type: 'vocabulary',
    ref_id: vocabId,
    status: 'completed',
    score: 100,
  });

  // Award XP
  const io = req.app.get('io');
  const xpResult = await xpService.awardXP(
    userId,
    isFirstWordOfDay ? 'first_word_of_day' : 'learn_new_word',
    { vocabId, isFirstWordOfDay },
    io
  );

  res.status(200).json({
    success: true,
    message: 'Vocabulary marked as learned',
    data: {
      vocabId,
      xpAwarded: xpResult.xpGained,
      totalXp: xpResult.totalXp,
      levelUp: xpResult.levelUp,
      newLevel: xpResult.newLevel,
      newBadges: xpResult.newBadges,
    },
  });
});

/**
 * Example: Review vocabulary correctly and award XP
 */
const reviewVocabularyCorrect = asyncHandler(async (req, res) => {
  const { vocabId } = req.params;
  const userId = req.user.id;

  // Update progress
  await UserProgress.update(
    { last_reviewed: new Date() },
    {
      where: {
        user_id: userId,
        type: 'vocabulary',
        ref_id: vocabId,
      },
    }
  );

  // Award XP
  const io = req.app.get('io');
  const xpResult = await xpService.awardXP(
    userId,
    'review_word_correct',
    { vocabId },
    io
  );

  res.status(200).json({
    success: true,
    message: 'Review recorded',
    data: xpResult,
  });
});

/**
 * Example: Complete lesson and award XP
 */
const completeLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { score } = req.body;
  const userId = req.user.id;

  // Save lesson progress
  await UserProgress.create({
    user_id: userId,
    type: 'lesson',
    ref_id: lessonId,
    status: 'completed',
    score,
  });

  // Award XP based on score
  const io = req.app.get('io');
  const action = score === 100 ? 'perfect_lesson' : 'complete_lesson';
  const xpResult = await xpService.awardXP(
    userId,
    action,
    { lessonId, score },
    io
  );

  res.status(200).json({
    success: true,
    message: 'Lesson completed',
    data: {
      lessonId,
      score,
      xpAwarded: xpResult.xpGained,
      totalXp: xpResult.totalXp,
      levelUp: xpResult.levelUp,
      newBadges: xpResult.newBadges,
    },
  });
});

/**
 * Example: Complete video segment and award XP
 */
const completeVideoSegment = asyncHandler(async (req, res) => {
  const { videoId, segmentIndex } = req.params;
  const userId = req.user.id;

  // Update video progress
  // ... video progress logic ...

  // Award XP
  const io = req.app.get('io');
  const xpResult = await xpService.awardXP(
    userId,
    'video_segment',
    { videoId, segmentIndex },
    io
  );

  res.status(200).json({
    success: true,
    message: 'Video segment completed',
    data: xpResult,
  });
});

/**
 * Example: AI conversation turn and award XP
 */
const recordAIConversationTurn = asyncHandler(async (req, res) => {
  const { conversationId, message } = req.body;
  const userId = req.user.id;

  // Save AI message
  // ... AI message logic ...

  // Award XP
  const io = req.app.get('io');
  const xpResult = await xpService.awardXP(
    userId,
    'ai_conversation_turn',
    { conversationId, messageLength: message.length },
    io
  );

  res.status(200).json({
    success: true,
    message: 'AI turn recorded',
    data: xpResult,
  });
});

module.exports = {
  markVocabularyAsLearned,
  reviewVocabularyCorrect,
  completeLesson,
  completeVideoSegment,
  recordAIConversationTurn,
};
