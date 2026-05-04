const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Topic = require('./Topic');
const Vocabulary = require('./Vocabulary');
const Lesson = require('./Lesson');
const Exercise = require('./Exercise');
const UserProgress = require('./UserProgress');
const AIConversation = require('./AIConversation');
const AIMessage = require('./AIMessage');
const VideoLesson = require('./VideoLesson');
const VideoSubtitle = require('./VideoSubtitle');
const UserVideoProgress = require('./UserVideoProgress');
const Ranking = require('./Ranking');
const Badge = require('./Badge');
const UserBadge = require('./UserBadge');
const Notification = require('./Notification');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const ReviewHistory = require('./ReviewHistory');
const QuizTemplate = require('./QuizTemplate');
const QuizTemplateQuestion = require('./QuizTemplateQuestion');

// ============================================================
// DEFINE ASSOCIATIONS
// ============================================================

// User associations
User.hasMany(Vocabulary, { foreignKey: 'created_by', as: 'vocabularies' });
User.hasMany(Lesson, { foreignKey: 'created_by', as: 'lessons' });
User.hasMany(VideoLesson, { foreignKey: 'created_by', as: 'videos' });
User.hasMany(UserProgress, { foreignKey: 'user_id', as: 'progress' });
User.hasMany(AIConversation, { foreignKey: 'user_id', as: 'conversations' });
User.hasMany(Ranking, { foreignKey: 'user_id', as: 'rankings' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.belongsToMany(Badge, { through: 'user_badges', foreignKey: 'user_id', as: 'badges' });

// Topic associations
Topic.hasMany(Vocabulary, { foreignKey: 'topic_id', as: 'vocabularies' });

// Vocabulary associations
Vocabulary.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });
Vocabulary.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Vocabulary.belongsToMany(Lesson, {
  through: 'lesson_vocabularies',
  foreignKey: 'vocab_id',
  otherKey: 'lesson_id',
  as: 'lessons',
});

// Lesson associations
Lesson.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Lesson.hasMany(Exercise, { foreignKey: 'lesson_id', as: 'exercises' });
Lesson.belongsToMany(Vocabulary, {
  through: 'lesson_vocabularies',
  foreignKey: 'lesson_id',
  otherKey: 'vocab_id',
  as: 'vocabularies',
});
Lesson.belongsToMany(Lesson, {
  through: 'lesson_prerequisites',
  foreignKey: 'lesson_id',
  otherKey: 'required_lesson_id',
  as: 'prerequisites',
});

// Exercise associations
Exercise.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

// UserProgress associations
UserProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserProgress.belongsTo(Vocabulary, { foreignKey: 'ref_id', as: 'vocabulary', constraints: false });
UserProgress.belongsTo(Lesson, { foreignKey: 'ref_id', as: 'lesson', constraints: false });
UserProgress.belongsTo(Topic, { foreignKey: 'ref_id', as: 'topic', constraints: false });

// AIConversation associations
AIConversation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AIConversation.hasMany(AIMessage, { foreignKey: 'conversation_id', as: 'messages' });

// AIMessage associations
AIMessage.belongsTo(AIConversation, { foreignKey: 'conversation_id', as: 'conversation' });

// VideoLesson associations
VideoLesson.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
VideoLesson.hasMany(VideoSubtitle, { foreignKey: 'video_id', as: 'subtitles' });
VideoLesson.hasMany(UserVideoProgress, { foreignKey: 'video_id', as: 'progress' });

// VideoSubtitle associations
VideoSubtitle.belongsTo(VideoLesson, { foreignKey: 'video_id', as: 'video' });

// UserVideoProgress associations
UserVideoProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserVideoProgress.belongsTo(VideoLesson, { foreignKey: 'video_id', as: 'video' });

// Ranking associations
Ranking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Badge associations
Badge.belongsToMany(User, { through: 'user_badges', foreignKey: 'badge_id', as: 'users' });

// UserBadge associations
UserBadge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id', as: 'badge' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Quiz associations
Quiz.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Quiz.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });
Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });

// QuizQuestion associations
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
QuizQuestion.belongsTo(Vocabulary, { foreignKey: 'ref_id', as: 'vocabulary', constraints: false });
QuizQuestion.belongsTo(Lesson, { foreignKey: 'ref_id', as: 'lesson', constraints: false });

// ReviewHistory associations
ReviewHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User associations for review system
User.hasMany(Quiz, { foreignKey: 'user_id', as: 'quizzes' });
User.hasMany(ReviewHistory, { foreignKey: 'user_id', as: 'reviewHistory' });

// QuizTemplate associations
QuizTemplate.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
QuizTemplate.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });
QuizTemplate.hasMany(QuizTemplateQuestion, { foreignKey: 'template_id', as: 'questions' });

// QuizTemplateQuestion associations
QuizTemplateQuestion.belongsTo(QuizTemplate, { foreignKey: 'template_id', as: 'template' });

// User associations for templates
User.hasMany(QuizTemplate, { foreignKey: 'created_by', as: 'quizTemplates' });

// ============================================================
// SYNC DATABASE (Development only)
// ============================================================
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  // Models
  User,
  Topic,
  Vocabulary,
  Lesson,
  Exercise,
  UserProgress,
  AIConversation,
  AIMessage,
  VideoLesson,
  VideoSubtitle,
  UserVideoProgress,
  Ranking,
  Badge,
  UserBadge,
  Notification,
  Quiz,
  QuizQuestion,
  ReviewHistory,
  QuizTemplate,
  QuizTemplateQuestion,
};
