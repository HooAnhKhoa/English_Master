const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Badge = sequelize.define(
  'Badge',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Badge name is required',
        },
      },
    },
    name_vi: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Vietnamese name is required',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Emoji or icon URL',
    },
    condition_type: {
      type: DataTypes.ENUM(
        'words_learned',
        'streak',
        'lessons_completed',
        'xp',
        'video_completed',
        'ai_turns',
        'perfect_score'
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Condition type is required',
        },
      },
    },
    condition_value: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    xp_reward: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    rarity: {
      type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
      allowNull: false,
      defaultValue: 'common',
    },
  },
  {
    tableName: 'badges',
    timestamps: false,
    underscored: true,
  }
);

module.exports = Badge;
