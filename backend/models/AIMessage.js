const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIMessage = sequelize.define(
  'AIMessage',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'ai_conversations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Role is required',
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Content is required',
        },
      },
    },
    audio_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'User audio recording URL',
    },
    grammar_errors: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of grammar errors detected',
    },
    suggestions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of improvement suggestions',
    },
    turn_score: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    tableName: 'ai_messages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['conversation_id'] }],
  }
);

module.exports = AIMessage;
