const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserBadge = sequelize.define(
  'UserBadge',
  {
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    badge_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'badges',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    awarded_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'user_badges',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['awarded_at'] },
    ],
  }
);

module.exports = UserBadge;
