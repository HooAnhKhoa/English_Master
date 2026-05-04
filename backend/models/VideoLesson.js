const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VideoLesson = sequelize.define(
  'VideoLesson',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title is required',
        },
      },
    },
    youtube_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    level: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Level is required',
        },
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    duration_sec: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Video duration in seconds',
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'video_lessons',
    timestamps: true,
    underscored: true,
  }
);

module.exports = VideoLesson;
