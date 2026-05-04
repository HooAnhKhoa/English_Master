const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ranking = sequelize.define(
  'Ranking',
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
    period: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'alltime'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Period is required',
        },
      },
    },
    period_key: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Format: 2024-01-15, 2024-W03, 2024-01, alltime',
    },
    xp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    words_learned: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    lessons_completed: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    streak_days: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    rank_position: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'rankings',
    timestamps: true,
    underscored: true,
    createdAt: false,
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'period', 'period_key'],
      },
      { fields: ['period', 'period_key', 'xp'] },
    ],
  }
);

module.exports = Ranking;
