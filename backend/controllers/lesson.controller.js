const { Lesson, Exercise, Vocabulary, User } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Get all lessons
 * @route   GET /api/v1/lessons
 * @access  Public
 */
const getAllLessons = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = 'sort_order',
    order = 'ASC',
    search,
    level,
    category,
    is_published,
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { title_vi: { [Op.like]: `%${search}%` } },
    ];
  }

  if (level) {
    where.level = level;
  }

  if (category) {
    where.category = category;
  }

  if (is_published !== undefined) {
    where.is_published = is_published === 'true';
  } else {
    // Default: only show published lessons for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      where.is_published = true;
    }
  }

  // Calculate pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Fetch lessons
  const { count, rows: lessons } = await Lesson.findAndCountAll({
    where,
    attributes: { exclude: ['content'] },
    order: [[sort, order.toUpperCase()]],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    data: lessons,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single lesson
 * @route   GET /api/v1/lessons/:id
 * @access  Public
 */
const getLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await Lesson.findByPk(id, {
    include: [
      {
        model: Exercise,
        as: 'exercises',
        attributes: { exclude: ['correct_answer'] },
        order: [['sort_order', 'ASC']],
      },
      {
        model: Vocabulary,
        as: 'vocabularies',
        attributes: ['id', 'word', 'meaning', 'pronunciation', 'part_of_speech'],
        through: { attributes: [] },
      },
      {
        model: Lesson,
        as: 'prerequisites',
        attributes: ['id', 'title', 'level'],
        through: { attributes: [] },
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'full_name'],
      },
    ],
  });

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Check if lesson is published (unless admin)
  if (!lesson.is_published && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(403, 'This lesson is not available');
  }

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

/**
 * @desc    Create new lesson
 * @route   POST /api/v1/lessons
 * @access  Private/Admin
 */
const createLesson = asyncHandler(async (req, res) => {
  const {
    title,
    title_vi,
    slug,
    description,
    level,
    category,
    content,
    duration,
    sort_order,
    is_published,
  } = req.body;

  // Check if slug already exists
  const existingLesson = await Lesson.findOne({ where: { slug } });

  if (existingLesson) {
    throw new ApiError(409, 'Lesson with this slug already exists');
  }

  // Create lesson
  const lesson = await Lesson.create({
    title,
    title_vi,
    slug,
    description,
    level,
    category,
    content,
    duration: duration || 15,
    sort_order: sort_order || 0,
    is_published: is_published || false,
    created_by: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully',
    data: lesson,
  });
});

/**
 * @desc    Update lesson
 * @route   PUT /api/v1/lessons/:id
 * @access  Private/Admin
 */
const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    title_vi,
    slug,
    description,
    level,
    category,
    content,
    duration,
    sort_order,
    is_published,
  } = req.body;

  const lesson = await Lesson.findByPk(id);

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Check if slug is taken
  if (slug && slug !== lesson.slug) {
    const existingLesson = await Lesson.findOne({ where: { slug } });
    if (existingLesson) {
      throw new ApiError(409, 'Slug already taken');
    }
  }

  // Update lesson
  if (title) lesson.title = title;
  if (title_vi !== undefined) lesson.title_vi = title_vi;
  if (slug) lesson.slug = slug;
  if (description !== undefined) lesson.description = description;
  if (level) lesson.level = level;
  if (category) lesson.category = category;
  if (content !== undefined) lesson.content = content;
  if (duration !== undefined) lesson.duration = duration;
  if (sort_order !== undefined) lesson.sort_order = sort_order;
  if (is_published !== undefined) lesson.is_published = is_published;

  await lesson.save();

  res.status(200).json({
    success: true,
    message: 'Lesson updated successfully',
    data: lesson,
  });
});

/**
 * @desc    Delete lesson
 * @route   DELETE /api/v1/lessons/:id
 * @access  Private/Admin
 */
const deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await Lesson.findByPk(id);

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Soft delete - unpublish
  lesson.is_published = false;
  await lesson.save();

  res.status(200).json({
    success: true,
    message: 'Lesson unpublished successfully',
  });
});

/**
 * @desc    Add vocabularies to lesson
 * @route   POST /api/v1/lessons/:id/vocabularies
 * @access  Private/Admin
 */
const addVocabulariesToLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vocabulary_ids } = req.body;

  if (!Array.isArray(vocabulary_ids) || vocabulary_ids.length === 0) {
    throw new ApiError(400, 'Please provide an array of vocabulary IDs');
  }

  const lesson = await Lesson.findByPk(id);

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Add vocabularies
  await lesson.addVocabularies(vocabulary_ids);

  res.status(200).json({
    success: true,
    message: 'Vocabularies added to lesson successfully',
  });
});

/**
 * @desc    Remove vocabulary from lesson
 * @route   DELETE /api/v1/lessons/:id/vocabularies/:vocabId
 * @access  Private/Admin
 */
const removeVocabularyFromLesson = asyncHandler(async (req, res) => {
  const { id, vocabId } = req.params;

  const lesson = await Lesson.findByPk(id);

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  await lesson.removeVocabulary(vocabId);

  res.status(200).json({
    success: true,
    message: 'Vocabulary removed from lesson successfully',
  });
});

module.exports = {
  getAllLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  addVocabulariesToLesson,
  removeVocabularyFromLesson,
};
