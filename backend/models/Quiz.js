const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quiz = sequelize.define(
  'Quiz',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    correct_answers: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    score: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    time_spent_sec: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Total time spent in seconds',
    },
    xp_earned: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('in-progress', 'completed', 'abandoned'),
      allowNull: false,
      defaultValue: 'in-progress',
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'quizzes',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id', 'status'] },
      { fields: ['user_id', 'created_at'] },
      { fields: ['type'] },
    ],
  }
);

module.exports = Quiz;
