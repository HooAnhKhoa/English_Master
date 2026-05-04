const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vocabulary = sequelize.define(
  'Vocabulary',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    word: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Word is required',
        },
      },
    },
    pronunciation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    audio_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    part_of_speech: {
      type: DataTypes.ENUM(
        'noun',
        'verb',
        'adjective',
        'adverb',
        'preposition',
        'conjunction',
        'pronoun',
        'interjection'
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Part of speech is required',
        },
      },
    },
    meaning: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Meaning is required',
        },
      },
    },
    definition: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    example: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    example_vi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    level: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
      allowNull: false,
      defaultValue: 'A1',
    },
    synonyms: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    antonyms: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
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
    tableName: 'vocabularies',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        type: 'FULLTEXT',
        fields: ['word'],
      },
      { fields: ['level'] },
      { fields: ['topic_id'] },
    ],
  }
);

module.exports = Vocabulary;
