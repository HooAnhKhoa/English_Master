const { Vocabulary, Topic, User } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs').promises;

/**
 * @desc    Get all vocabularies
 * @route   GET /api/v1/vocabularies
 * @access  Public
 */
const getAllVocabularies = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = 'created_at',
    order = 'DESC',
    search,
    level,
    part_of_speech,
    topic_id,
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where[Op.or] = [
      { word: { [Op.like]: `%${search}%` } },
      { meaning: { [Op.like]: `%${search}%` } },
    ];
  }

  if (level) {
    where.level = level;
  }

  if (part_of_speech) {
    where.part_of_speech = part_of_speech;
  }

  if (topic_id) {
    where.topic_id = topic_id;
  }

  // Filter by is_active for non-admin users
  if (!req.user || req.user.role !== 'admin') {
    where.is_active = true;
  }

  // Calculate pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Fetch vocabularies
  const { count, rows: vocabularies } = await Vocabulary.findAndCountAll({
    where,
    include: [
      {
        model: Topic,
        as: 'topic',
        attributes: ['id', 'name', 'name_vi', 'icon'],
      },
    ],
    order: [[sort, order.toUpperCase()]],
    limit: parseInt(limit),
    offset,
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

/**
 * @desc    Get single vocabulary
 * @route   GET /api/v1/vocabularies/:id
 * @access  Public
 */
const getVocabulary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vocabulary = await Vocabulary.findByPk(id, {
    include: [
      {
        model: Topic,
        as: 'topic',
        attributes: ['id', 'name', 'name_vi', 'icon'],
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'full_name'],
      },
    ],
  });

  if (!vocabulary) {
    throw new ApiError(404, 'Vocabulary not found');
  }

  // Check if active for non-admin users
  if (!vocabulary.is_active && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(403, 'This vocabulary is not available');
  }

  res.status(200).json({
    success: true,
    data: vocabulary,
  });
});

/**
 * @desc    Create new vocabulary
 * @route   POST /api/v1/vocabularies
 * @access  Private/Admin
 */
const createVocabulary = asyncHandler(async (req, res) => {
  const {
    word,
    pronunciation,
    part_of_speech,
    meaning,
    definition,
    example,
    example_vi,
    level,
    synonyms,
    antonyms,
    tags,
    topic_id,
    is_active,
  } = req.body;

  // Create vocabulary
  const vocabulary = await Vocabulary.create({
    word,
    pronunciation,
    part_of_speech,
    meaning,
    definition,
    example,
    example_vi,
    level: level || 'A1',
    synonyms,
    antonyms,
    tags,
    topic_id,
    is_active: is_active !== undefined ? is_active : true,
    created_by: req.user.id,
  });

  // Update topic word count
  if (topic_id) {
    const topic = await Topic.findByPk(topic_id);
    if (topic) {
      topic.word_count += 1;
      await topic.save();
    }
  }

  res.status(201).json({
    success: true,
    message: 'Vocabulary created successfully',
    data: vocabulary,
  });
});

/**
 * @desc    Update vocabulary
 * @route   PUT /api/v1/vocabularies/:id
 * @access  Private/Admin
 */
const updateVocabulary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    word,
    pronunciation,
    part_of_speech,
    meaning,
    definition,
    example,
    example_vi,
    level,
    synonyms,
    antonyms,
    tags,
    topic_id,
  } = req.body;

  const vocabulary = await Vocabulary.findByPk(id);

  if (!vocabulary) {
    throw new ApiError(404, 'Vocabulary not found');
  }

  const oldTopicId = vocabulary.topic_id;

  // Update vocabulary
  if (word) vocabulary.word = word;
  if (pronunciation !== undefined) vocabulary.pronunciation = pronunciation;
  if (part_of_speech) vocabulary.part_of_speech = part_of_speech;
  if (meaning) vocabulary.meaning = meaning;
  if (definition !== undefined) vocabulary.definition = definition;
  if (example !== undefined) vocabulary.example = example;
  if (example_vi !== undefined) vocabulary.example_vi = example_vi;
  if (level) vocabulary.level = level;
  if (synonyms !== undefined) vocabulary.synonyms = synonyms;
  if (antonyms !== undefined) vocabulary.antonyms = antonyms;
  if (tags !== undefined) vocabulary.tags = tags;
  if (topic_id !== undefined) vocabulary.topic_id = topic_id;

  await vocabulary.save();

  // Update topic word counts if topic changed
  if (topic_id !== undefined && oldTopicId !== topic_id) {
    if (oldTopicId) {
      const oldTopic = await Topic.findByPk(oldTopicId);
      if (oldTopic && oldTopic.word_count > 0) {
        oldTopic.word_count -= 1;
        await oldTopic.save();
      }
    }
    if (topic_id) {
      const newTopic = await Topic.findByPk(topic_id);
      if (newTopic) {
        newTopic.word_count += 1;
        await newTopic.save();
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Vocabulary updated successfully',
    data: vocabulary,
  });
});

/**
 * @desc    Delete vocabulary
 * @route   DELETE /api/v1/vocabularies/:id
 * @access  Private/Admin
 */
const deleteVocabulary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vocabulary = await Vocabulary.findByPk(id);

  if (!vocabulary) {
    throw new ApiError(404, 'Vocabulary not found');
  }

  const topicId = vocabulary.topic_id;

  // Delete vocabulary
  await vocabulary.destroy();

  // Update topic word count
  if (topicId) {
    const topic = await Topic.findByPk(topicId);
    if (topic && topic.word_count > 0) {
      topic.word_count -= 1;
      await topic.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Vocabulary deleted successfully',
  });
});

/**
 * @desc    Upload vocabulary image
 * @route   POST /api/v1/vocabularies/:id/image
 * @access  Private/Admin
 */
const uploadVocabularyImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file');
  }

  const vocabulary = await Vocabulary.findByPk(id);

  if (!vocabulary) {
    throw new ApiError(404, 'Vocabulary not found');
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'englishmaster/vocabularies', 'image');

    // Delete old image if exists
    if (vocabulary.image_url) {
      const publicId = vocabulary.image_url.split('/').slice(-2).join('/').split('.')[0];
      await deleteFromCloudinary(publicId, 'image').catch(() => {});
    }

    // Update vocabulary
    vocabulary.image_url = result.url;
    await vocabulary.save();

    // Delete local file
    await fs.unlink(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image_url: vocabulary.image_url,
      },
    });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

/**
 * @desc    Upload vocabulary audio
 * @route   POST /api/v1/vocabularies/:id/audio
 * @access  Private/Admin
 */
const uploadVocabularyAudio = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw new ApiError(400, 'Please upload an audio file');
  }

  const vocabulary = await Vocabulary.findByPk(id);

  if (!vocabulary) {
    throw new ApiError(404, 'Vocabulary not found');
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'englishmaster/audios', 'auto');

    // Delete old audio if exists
    if (vocabulary.audio_url) {
      const publicId = vocabulary.audio_url.split('/').slice(-2).join('/').split('.')[0];
      await deleteFromCloudinary(publicId, 'video').catch(() => {});
    }

    // Update vocabulary
    vocabulary.audio_url = result.url;
    await vocabulary.save();

    // Delete local file
    await fs.unlink(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Audio uploaded successfully',
      data: {
        audio_url: vocabulary.audio_url,
      },
    });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

module.exports = {
  getAllVocabularies,
  getVocabulary,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  uploadVocabularyImage,
  uploadVocabularyAudio,
};
