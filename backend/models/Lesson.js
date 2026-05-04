const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lesson = sequelize.define(
  'Lesson',
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
    title_vi: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Slug is required',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
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
      type: DataTypes.ENUM('grammar', 'vocabulary', 'listening', 'speaking', 'reading', 'writing'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Category is required',
        },
      },
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    duration: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      defaultValue: 15,
    },
    sort_order: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'lessons',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['level', 'category'] },
      { fields: ['is_published'] },
    ],
  }
);

module.exports = Lesson;
