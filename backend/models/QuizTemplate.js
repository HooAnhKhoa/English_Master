const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizTemplate = sequelize.define(
  'QuizTemplate',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('vocab', 'lesson', 'mixed'),
      allowNull: false,
      defaultValue: 'vocab',
    },
    level: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
      allowNull: true,
    },
    topic_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'topics',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    total_questions: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 10,
    },
    time_limit_sec: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Time limit in seconds',
    },
    passing_score: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 60,
      validate: {
        min: 0,
        max: 100,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    tableName: 'quiz_templates',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['level'] },
      { fields: ['is_active'] },
    ],
  }
);

module.exports = QuizTemplate;
