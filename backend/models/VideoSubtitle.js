const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VideoSubtitle = sequelize.define(
  'VideoSubtitle',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    video_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'video_lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    start_time: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      comment: 'Start time in seconds',
    },
    end_time: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      comment: 'End time in seconds',
    },
    text_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'English text is required',
        },
      },
    },
    text_vi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'video_subtitles',
    timestamps: false,
    underscored: true,
    indexes: [{ fields: ['video_id'] }],
  }
);

module.exports = VideoSubtitle;
