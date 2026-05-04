const { Topic, Vocabulary } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Get all topics
 * @route   GET /api/v1/topics
 * @access  Public
 */
const getAllTopics = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = 'sort_order',
    order = 'ASC',
    search,
    level,
    is_active,
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { name_vi: { [Op.like]: `%${search}%` } },
    ];
  }

  if (level) {
    where.level = level;
  }

  if (is_active !== undefined) {
    where.is_active = is_active === 'true';
  }

  // Calculate pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Fetch topics with word count
  const { count, rows: topics } = await Topic.findAndCountAll({
    where,
    order: [[sort, order.toUpperCase()]],
    limit: parseInt(limit),
    offset,
    include: [
      {
        model: Vocabulary,
        as: 'vocabularies',
        attributes: [],
        where: { is_active: true },
        required: false,
      },
    ],
    attributes: {
      include: [
        [
          require('sequelize').fn('COUNT', require('sequelize').col('vocabularies.id')),
          'word_count'
        ],
      ],
    },
    group: ['Topic.id'],
    subQuery: false,
  });

  res.status(200).json({
    success: true,
    data: topics,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count.length || 0,
      totalPages: Math.ceil((count.length || 0) / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single topic
 * @route   GET /api/v1/topics/:id
 * @access  Public
 */
const getTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await Topic.findByPk(id, {
    include: [
      {
        model: Vocabulary,
        as: 'vocabularies',
        attributes: ['id', 'word', 'meaning', 'level', 'part_of_speech'],
        where: { is_active: true },
        required: false,
        limit: 10,
      },
    ],
  });

  if (!topic) {
    throw new ApiError(404, 'Topic not found');
  }

  res.status(200).json({
    success: true,
    data: topic,
  });
});

/**
 * @desc    Create new topic
 * @route   POST /api/v1/topics
 * @access  Private/Admin
 */
const createTopic = asyncHandler(async (req, res) => {
  const { name, name_vi, slug, icon, description, level, sort_order } = req.body;

  // Check if slug already exists
  const existingTopic = await Topic.findOne({ where: { slug } });

  if (existingTopic) {
    throw new ApiError(409, 'Topic with this slug already exists');
  }

  // Create topic
  const topic = await Topic.create({
    name,
    name_vi,
    slug,
    icon,
    description,
    level,
    sort_order: sort_order || 0,
  });

  res.status(201).json({
    success: true,
    message: 'Topic created successfully',
    data: topic,
  });
});

/**
 * @desc    Update topic
 * @route   PUT /api/v1/topics/:id
 * @access  Private/Admin
 */
const updateTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, name_vi, slug, icon, description, level, is_active, sort_order } = req.body;

  const topic = await Topic.findByPk(id);

  if (!topic) {
    throw new ApiError(404, 'Topic not found');
  }

  // Check if slug is taken by another topic
  if (slug && slug !== topic.slug) {
    const existingTopic = await Topic.findOne({ where: { slug } });
    if (existingTopic) {
      throw new ApiError(409, 'Slug already taken');
    }
  }

  // Update topic
  if (name) topic.name = name;
  if (name_vi) topic.name_vi = name_vi;
  if (slug) topic.slug = slug;
  if (icon !== undefined) topic.icon = icon;
  if (description !== undefined) topic.description = description;
  if (level) topic.level = level;
  if (is_active !== undefined) topic.is_active = is_active;
  if (sort_order !== undefined) topic.sort_order = sort_order;

  await topic.save();

  res.status(200).json({
    success: true,
    message: 'Topic updated successfully',
    data: topic,
  });
});

/**
 * @desc    Delete topic (soft delete)
 * @route   DELETE /api/v1/topics/:id
 * @access  Private/Admin
 */
const deleteTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await Topic.findByPk(id);

  if (!topic) {
    throw new ApiError(404, 'Topic not found');
  }

  // Soft delete
  topic.is_active = false;
  await topic.save();

  res.status(200).json({
    success: true,
    message: 'Topic deactivated successfully',
  });
});

/**
 * @desc    Get topic vocabularies
 * @route   GET /api/v1/topics/:id/vocabularies
 * @access  Public
 */
const getTopicVocabularies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, level } = req.query;

  const topic = await Topic.findByPk(id);

  if (!topic) {
    throw new ApiError(404, 'Topic not found');
  }

  const where = { topic_id: id };
  if (level) {
    where.level = level;
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows: vocabularies } = await Vocabulary.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: vocabularies,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

module.exports = {
  getAllTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicVocabularies,
};
