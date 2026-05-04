const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProgress = sequelize.define(
  'UserProgress',
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
      type: DataTypes.ENUM('lesson', 'vocabulary', 'topic'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Progress type is required',
        },
      },
    },
    ref_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'Reference ID to lesson, vocabulary, or topic',
    },
    status: {
      type: DataTypes.ENUM('not-started', 'in-progress', 'completed', 'mastered'),
      allowNull: false,
      defaultValue: 'not-started',
    },
    score: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    attempts: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    last_studied: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Spaced Repetition System (SM-2 Algorithm)
    next_review: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ef_factor: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 2.5,
      comment: 'Ease Factor for spaced repetition',
    },
    interval_days: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    repetitions: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'user_progress',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'type', 'ref_id'],
      },
      { fields: ['user_id', 'next_review'] },
    ],
  }
);

module.exports = UserProgress;
