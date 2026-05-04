const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { Quiz, QuizQuestion, QuizTemplate, QuizTemplateQuestion, User, Topic } = require('../models');
const { Op } = require('sequelize');

// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);

/**
 * GET /api/v1/admin/quiz-templates
 * Get all quiz templates
 */
router.get('/quiz-templates', async (req, res) => {
  try {
    const templates = await QuizTemplate.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi', 'icon']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get quiz templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz templates',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/admin/quiz-templates/:id
 * Get quiz template with questions
 */
router.get('/quiz-templates/:id', async (req, res) => {
  try {
    const template = await QuizTemplate.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi', 'icon']
        },
        {
          model: QuizTemplateQuestion,
          as: 'questions',
          order: [['order_index', 'ASC']]
        }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Quiz template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get quiz template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz template',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/admin/quiz-templates
 * Create new quiz template
 */
router.post('/quiz-templates', async (req, res) => {
  try {
    const { title, description, type, level, topic_id, total_questions, time_limit_sec, passing_score, questions } = req.body;

    const template = await QuizTemplate.create({
      title,
      description,
      type,
      level,
      topic_id,
      total_questions,
      time_limit_sec,
      passing_score,
      created_by: req.user.id
    });

    // Create questions if provided
    if (questions && questions.length > 0) {
      const questionsData = questions.map((q, index) => ({
        template_id: template.id,
        question_type: q.question_type,
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        options: q.options,
        explanation: q.explanation,
        points: q.points || 10,
        order_index: index
      }));

      await QuizTemplateQuestion.bulkCreate(questionsData);
    }

    // Fetch complete template with questions
    const completeTemplate = await QuizTemplate.findByPk(template.id, {
      include: [
        {
          model: QuizTemplateQuestion,
          as: 'questions',
          order: [['order_index', 'ASC']]
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi']
        }
      ]
    });

    res.json({
      success: true,
      data: completeTemplate,
      message: 'Quiz template created successfully'
    });
  } catch (error) {
    console.error('Create quiz template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz template',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/admin/quiz-templates/:id
 * Update quiz template
 */
router.put('/quiz-templates/:id', async (req, res) => {
  try {
    const template = await QuizTemplate.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Quiz template not found'
      });
    }

    const { title, description, type, level, topic_id, total_questions, time_limit_sec, passing_score, is_active, questions } = req.body;

    await template.update({
      title,
      description,
      type,
      level,
      topic_id,
      total_questions,
      time_limit_sec,
      passing_score,
      is_active
    });

    // Update questions if provided
    if (questions) {
      // Delete old questions
      await QuizTemplateQuestion.destroy({
        where: { template_id: template.id }
      });

      // Create new questions
      if (questions.length > 0) {
        const questionsData = questions.map((q, index) => ({
          template_id: template.id,
          question_type: q.question_type,
          question_text: q.question_text,
          correct_answer: q.correct_answer,
          options: q.options,
          explanation: q.explanation,
          points: q.points || 10,
          order_index: index
        }));

        await QuizTemplateQuestion.bulkCreate(questionsData);
      }
    }

    // Fetch updated template
    const updatedTemplate = await QuizTemplate.findByPk(template.id, {
      include: [
        {
          model: QuizTemplateQuestion,
          as: 'questions',
          order: [['order_index', 'ASC']]
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Quiz template updated successfully'
    });
  } catch (error) {
    console.error('Update quiz template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz template',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/admin/quiz-templates/:id
 * Delete quiz template
 */
router.delete('/quiz-templates/:id', async (req, res) => {
  try {
    const template = await QuizTemplate.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Quiz template not found'
      });
    }

    await template.destroy();

    res.json({
      success: true,
      message: 'Quiz template deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz template',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/admin/quizzes
 * Get all completed quizzes (for stats/history)
 */
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'full_name']
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quizzes',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/admin/quizzes/:id
 * Get quiz details with questions
 */
router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'full_name']
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['id', 'name', 'name_vi']
        },
        {
          model: QuizQuestion,
          as: 'questions',
          order: [['order_index', 'ASC']]
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/admin/quizzes/:id
 * Delete quiz
 */
router.delete('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    await quiz.destroy();

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
});

module.exports = router;
