const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exercise = sequelize.define(
  'Exercise',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    lesson_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM(
        'multiple-choice',
        'fill-blank',
        'matching',
        'word-order',
        'pronunciation',
        'writing'
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Exercise type is required',
        },
      },
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Question is required',
        },
      },
    },
    question_audio: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of options for multiple-choice, matching, etc.',
    },
    correct_answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Correct answer is required',
        },
      },
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    points: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 10,
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      defaultValue: 'medium',
    },
    sort_order: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'exercises',
    timestamps: false,
    underscored: true,
    indexes: [{ fields: ['lesson_id'] }],
  }
);

module.exports = Exercise;
