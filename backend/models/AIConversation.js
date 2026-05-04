const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIConversation = sequelize.define(
  'AIConversation',
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
    topic: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    scenario: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'job_interview, ordering_food, travel, shopping, etc.',
    },
    level: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    total_turns: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    overall_score: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    duration_sec: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Conversation duration in seconds',
    },
  },
  {
    tableName: 'ai_conversations',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['user_id'] }],
  }
);

module.exports = AIConversation;
