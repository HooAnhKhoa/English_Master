const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizQuestion = sequelize.define(
  'QuizQuestion',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    quiz_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    question_type: {
      type: DataTypes.ENUM('multiple_choice', 'fill_blank', 'word_order'),
      allowNull: false,
      defaultValue: 'multiple_choice',
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The question or prompt',
    },
    correct_answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The correct answer',
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of options for multiple choice',
    },
    user_answer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User submitted answer',
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Whether user answer is correct',
    },
    time_spent_ms: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Time spent on this question in milliseconds',
    },
    ref_type: {
      type: DataTypes.ENUM('vocabulary', 'lesson'),
      allowNull: true,
      comment: 'Type of reference content',
    },
    ref_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'ID of vocabulary or lesson',
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Explanation for the correct answer',
    },
    order_index: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order of question in quiz',
    },
  },
  {
    tableName: 'quiz_questions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['quiz_id', 'order_index'] },
      { fields: ['ref_type', 'ref_id'] },
    ],
  }
);

module.exports = QuizQuestion;
