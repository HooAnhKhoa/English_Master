const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserVideoProgress = sequelize.define(
  'UserVideoProgress',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'video_lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    current_time: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: 'Current playback time in seconds',
    },
    completed_segments: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of completed subtitle IDs',
    },
    pronunciation_scores: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Object mapping subtitle_id to pronunciation score data',
    },
    dictation_answers: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Object mapping subtitle_id to dictation answer data',
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'user_video_progress',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'video_id'],
      },
    ],
  }
);

module.exports = UserVideoProgress;
