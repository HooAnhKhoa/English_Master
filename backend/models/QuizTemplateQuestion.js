const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizTemplateQuestion = sequelize.define(
  'QuizTemplateQuestion',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    template_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'quiz_templates',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    question_type: {
      type: DataTypes.ENUM('multiple_choice', 'fill_blank', 'word_order', 'true_false'),
      allowNull: false,
      defaultValue: 'multiple_choice',
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    correct_answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of options for multiple choice',
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    points: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 10,
    },
    order_index: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'quiz_template_questions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['template_id', 'order_index'] },
    ],
  }
);

module.exports = QuizTemplateQuestion;
