const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const {
  Quiz,
  QuizQuestion,
  ReviewHistory,
  UserProgress,
  Vocabulary,
  Topic,
  Lesson,
  User
} = require('../models');

/**
 * GET /api/review/dashboard
 * Get review dashboard data for current user
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 1. Due today (vocab + lessons with next_review <= tomorrow)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueVocab = await UserProgress.count({
      where: {
        user_id: userId,
        type: 'vocabulary',
        next_review: { [Op.lte]: tomorrow },
        status: { [Op.ne]: 'mastered' }
      }
    });

    const dueLessons = await UserProgress.count({
      where: {
        user_id: userId,
        type: 'lesson',
        next_review: { [Op.lte]: tomorrow },
        status: { [Op.ne]: 'mastered' }
      }
    });

    const dueVideos = await UserProgress.count({
      where: {
        user_id: userId,
        type: 'video',
        status: { [Op.in]: ['not-started', 'in-progress'] }
      }
    });

    // 2. Weekly stats
    const weeklyHistory = await ReviewHistory.findAll({
      where: {
        user_id: userId,
        review_date: { [Op.gte]: weekAgo }
      }
    });

    const daysStudied = weeklyHistory.length;
    const totalWords = weeklyHistory.reduce((sum, h) => sum + h.words_reviewed, 0);
    const totalMinutes = weeklyHistory.reduce((sum, h) => sum + h.time_spent_minutes, 0);
    const totalCorrect = weeklyHistory.reduce((sum, h) => sum + h.correct_answers, 0);
    const totalQuestions = weeklyHistory.reduce((sum, h) => sum + h.total_questions, 0);
    const accuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(2) : 0;

    // 3. Weak areas (topics with lowest accuracy)
    const topicProgress = await UserProgress.findAll({
      where: {
        user_id: userId,
        type: 'vocabulary',
        score: { [Op.ne]: null }
      },
      include: [{
        model: Vocabulary,
        as: 'vocabulary',
        attributes: ['topic_id'],
        include: [{
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi']
        }]
      }],
      attributes: ['ref_id', 'score']
    });

    const topicStats = {};
    topicProgress.forEach(progress => {
      if (progress.vocabulary && progress.vocabulary.topic) {
        const topicId = progress.vocabulary.topic.id;
        if (!topicStats[topicId]) {
          topicStats[topicId] = {
            type: 'topic',
            name: progress.vocabulary.topic.name,
            name_vi: progress.vocabulary.topic.name_vi,
            totalScore: 0,
            count: 0
          };
        }
        topicStats[topicId].totalScore += progress.score;
        topicStats[topicId].count += 1;
      }
    });

    const weakAreas = Object.values(topicStats)
      .map(stat => ({
        type: stat.type,
        name: stat.name,
        name_vi: stat.name_vi,
        accuracy: (stat.totalScore / stat.count).toFixed(2),
        count: stat.count
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    // 4. Upcoming reviews (next 7 days)
    const upcomingReviews = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await UserProgress.count({
        where: {
          user_id: userId,
          next_review: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });

      upcomingReviews.push({
        date: date.toISOString().split('T')[0],
        count,
        type: 'all'
      });
    }

    res.json({
      success: true,
      data: {
        dueToday: {
          vocab: dueVocab,
          lessons: dueLessons,
          videos: dueVideos
        },
        weeklyStats: {
          daysStudied,
          totalWords,
          totalMinutes,
          accuracy: parseFloat(accuracy)
        },
        weakAreas,
        upcomingReviews
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
};

/**
 * GET /api/review/vocab/due
 * Get vocabularies due for review
 */
exports.getVocabDue = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueProgress = await UserProgress.findAll({
      where: {
        user_id: userId,
        type: 'vocabulary',
        next_review: { [Op.lte]: tomorrow },
        status: { [Op.ne]: 'mastered' }
      },
      include: [{
        model: Vocabulary,
        as: 'vocabulary',
        include: [{
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi', 'icon']
        }]
      }],
      order: [['next_review', 'ASC']]
    });

    // Group by topic
    const byTopic = {};
    dueProgress.forEach(progress => {
      const vocab = progress.vocabulary;
      if (!vocab) return;

      const topicId = vocab.topic_id || 0;
      const topicName = vocab.topic ? vocab.topic.name : 'Uncategorized';

      if (!byTopic[topicId]) {
        byTopic[topicId] = {
          topicId,
          topicName,
          topicNameVi: vocab.topic ? vocab.topic.name_vi : 'Chưa phân loại',
          icon: vocab.topic ? vocab.topic.icon : '📚',
          count: 0,
          words: []
        };
      }

      byTopic[topicId].count += 1;
      byTopic[topicId].words.push({
        id: vocab.id,
        word: vocab.word,
        pronunciation: vocab.pronunciation,
        meaning: vocab.meaning,
        level: vocab.level,
        next_review: progress.next_review,
        overdue: progress.next_review < now
      });
    });

    res.json({
      success: true,
      data: {
        total: dueProgress.length,
        byTopic: Object.values(byTopic)
      }
    });
  } catch (error) {
    console.error('Get vocab due error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get due vocabularies',
      error: error.message
    });
  }
};

/**
 * GET /api/review/quiz/generate
 * Generate a new quiz
 */
exports.generateQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'vocab', count = 10, level, topicId } = req.query;

    const questionCount = Math.min(parseInt(count), 50);

    // Create quiz record
    const quiz = await Quiz.create({
      user_id: userId,
      type,
      level: level || null,
      topic_id: topicId || null,
      total_questions: questionCount,
      status: 'in-progress'
    });

    let questions = [];

    if (type === 'vocab' || type === 'mixed') {
      // Get user's learned vocabularies
      const where = {
        user_id: userId,
        type: 'vocabulary',
        status: { [Op.ne]: 'not-started' }
      };

      const vocabProgress = await UserProgress.findAll({
        where,
        include: [{
          model: Vocabulary,
          as: 'vocabulary',
          where: {
            ...(level && { level }),
            ...(topicId && { topic_id: topicId })
          }
        }],
        order: [['score', 'ASC'], ['last_studied', 'ASC']],
        limit: questionCount
      });

      // Generate questions from vocabularies
      for (let i = 0; i < vocabProgress.length; i++) {
        const progress = vocabProgress[i];
        const vocab = progress.vocabulary;

        // Randomly choose question type
        const questionTypes = ['multiple_choice', 'fill_blank'];
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        let questionData;

        if (questionType === 'multiple_choice') {
          // EN -> VI or VI -> EN
          const direction = Math.random() > 0.5 ? 'en_vi' : 'vi_en';

          // Get wrong options
          const wrongOptions = await Vocabulary.findAll({
            where: {
              id: { [Op.ne]: vocab.id },
              level: vocab.level
            },
            order: [[sequelize.fn('RAND')]],
            limit: 3,
            attributes: ['word', 'meaning']
          });

          let options, correctAnswer, questionText;

          if (direction === 'en_vi') {
            questionText = `What does "${vocab.word}" mean?`;
            correctAnswer = vocab.meaning;
            options = [
              vocab.meaning,
              ...wrongOptions.map(w => w.meaning)
            ];
          } else {
            questionText = `How do you say "${vocab.meaning}" in English?`;
            correctAnswer = vocab.word;
            options = [
              vocab.word,
              ...wrongOptions.map(w => w.word)
            ];
          }

          // Shuffle options
          options = options.sort(() => Math.random() - 0.5);

          questionData = {
            quiz_id: quiz.id,
            question_type: 'multiple_choice',
            question_text: questionText,
            correct_answer: correctAnswer,
            options: options,
            ref_type: 'vocabulary',
            ref_id: vocab.id,
            explanation: `${vocab.word} (${vocab.pronunciation}) - ${vocab.meaning}. Example: ${vocab.example}`,
            order_index: i
          };
        } else {
          // Fill blank
          const example = vocab.example || `I use ___ every day.`;
          const questionText = example.replace(new RegExp(vocab.word, 'gi'), '___');

          questionData = {
            quiz_id: quiz.id,
            question_type: 'fill_blank',
            question_text: questionText,
            correct_answer: vocab.word,
            options: null,
            ref_type: 'vocabulary',
            ref_id: vocab.id,
            explanation: `Correct answer: ${vocab.word} - ${vocab.meaning}`,
            order_index: i
          };
        }

        questions.push(questionData);
      }
    }

    // Create all questions
    await QuizQuestion.bulkCreate(questions);

    // Fetch created questions
    const createdQuestions = await QuizQuestion.findAll({
      where: { quiz_id: quiz.id },
      order: [['order_index', 'ASC']],
      attributes: ['id', 'question_type', 'question_text', 'options', 'order_index']
    });

    const estimatedTime = questionCount * 30; // 30 seconds per question

    res.json({
      success: true,
      data: {
        quizId: quiz.id,
        questions: createdQuestions,
        estimatedTime
      }
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
};

/**
 * POST /api/review/quiz/submit
 * Submit quiz answers and get results
 */
exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, answers } = req.body;

    // Validate quiz belongs to user
    const quiz = await Quiz.findOne({
      where: { id: quizId, user_id: userId }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Quiz already completed'
      });
    }

    // Get all questions
    const questions = await QuizQuestion.findAll({
      where: { quiz_id: quizId },
      order: [['order_index', 'ASC']]
    });

    let correctCount = 0;
    const details = [];
    let totalTimeMs = 0;

    // Process each answer
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const userAnswer = answer.answer.trim();
      const correctAnswer = question.correct_answer.trim();
      let isCorrect = false;

      // Check answer based on question type
      if (question.question_type === 'multiple_choice') {
        isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
      } else if (question.question_type === 'fill_blank') {
        isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
      } else if (question.question_type === 'word_order') {
        isCorrect = userAnswer === correctAnswer;
      }

      if (isCorrect) correctCount++;

      // Update question with user answer
      await question.update({
        user_answer: userAnswer,
        is_correct: isCorrect,
        time_spent_ms: answer.timeMs || 0
      });

      totalTimeMs += answer.timeMs || 0;

      details.push({
        questionId: question.id,
        question: question.question_text,
        correctAnswer: question.correct_answer,
        userAnswer,
        isCorrect,
        explanation: question.explanation,
        options: question.options
      });

      // Update user progress for vocabulary
      if (question.ref_type === 'vocabulary' && question.ref_id) {
        const progress = await UserProgress.findOne({
          where: {
            user_id: userId,
            type: 'vocabulary',
            ref_id: question.ref_id
          }
        });

        if (progress) {
          // Update score (weighted average)
          const newScore = isCorrect ? 100 : 0;
          const updatedScore = progress.score
            ? Math.round((progress.score * 0.7) + (newScore * 0.3))
            : newScore;

          await progress.update({
            score: updatedScore,
            attempts: progress.attempts + 1,
            last_studied: new Date()
          });
        }
      }
    }

    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = Math.round(correctCount * 10 + (score >= 80 ? 50 : 0));

    // Update quiz
    await quiz.update({
      correct_answers: correctCount,
      score,
      xp_earned: xpEarned,
      time_spent_sec: Math.round(totalTimeMs / 1000),
      status: 'completed',
      completed_at: new Date()
    });

    // Update user XP
    const user = await User.findByPk(userId);
    await user.update({
      xp: user.xp + xpEarned
    });

    // Update review history
    const today = new Date().toISOString().split('T')[0];
    const [history, created] = await ReviewHistory.findOrCreate({
      where: {
        user_id: userId,
        review_date: today
      },
      defaults: {
        words_reviewed: 0,
        quizzes_completed: 0,
        total_questions: 0,
        correct_answers: 0,
        accuracy: 0,
        xp_earned: 0,
        time_spent_minutes: 0
      }
    });

    await history.update({
      quizzes_completed: history.quizzes_completed + 1,
      total_questions: history.total_questions + questions.length,
      correct_answers: history.correct_answers + correctCount,
      accuracy: ((history.correct_answers + correctCount) / (history.total_questions + questions.length) * 100).toFixed(2),
      xp_earned: history.xp_earned + xpEarned,
      time_spent_minutes: history.time_spent_minutes + Math.round(totalTimeMs / 60000)
    });

    res.json({
      success: true,
      data: {
        score,
        correct: correctCount,
        wrong: questions.length - correctCount,
        total: questions.length,
        xpEarned,
        details
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

/**
 * GET /api/review/history
 * Get review history for last 30 days
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await ReviewHistory.findAll({
      where: {
        user_id: userId,
        review_date: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['review_date', 'DESC']],
      attributes: [
        'review_date',
        'words_reviewed',
        'quizzes_completed',
        'accuracy',
        'xp_earned',
        'time_spent_minutes',
        'total_questions',
        'correct_answers'
      ]
    });

    const totalDays = history.length;
    const totalCorrect = history.reduce((sum, h) => sum + h.correct_answers, 0);
    const totalQuestions = history.reduce((sum, h) => sum + h.total_questions, 0);
    const averageAccuracy = totalQuestions > 0
      ? ((totalCorrect / totalQuestions) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        history,
        totalDays,
        averageAccuracy: parseFloat(averageAccuracy)
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get review history',
      error: error.message
    });
  }
};

module.exports = exports;
