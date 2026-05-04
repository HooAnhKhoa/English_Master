const axios = require('axios');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { cache } = require('../config/redis');

/**
 * @desc    Search word in dictionary
 * @route   GET /api/v1/dictionary/search/:word
 * @access  Public
 */
const searchWord = asyncHandler(async (req, res) => {
  const { word } = req.params;

  if (!word) {
    throw new ApiError(400, 'Word is required');
  }

  // Check cache first
  const cacheKey = `dictionary:${word.toLowerCase()}`;
  const cachedData = await cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      data: cachedData,
      cached: true,
    });
  }

  try {
    // Fetch from Free Dictionary API
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

    const data = response.data[0];

    const result = {
      word: data.word,
      phonetic: data.phonetic || null,
      phonetics: data.phonetics || [],
      meanings: data.meanings || [],
      origin: data.origin || null,
    };

    // Cache for 24 hours
    await cache.set(cacheKey, result, 86400);

    // Save search history if user is logged in
    if (req.user) {
      // This would be saved to user_search_history table
      // Implementation depends on your model structure
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new ApiError(404, 'Word not found in dictionary');
    }
    throw new ApiError(500, 'Failed to fetch word definition');
  }
});

/**
 * @desc    Get word suggestions
 * @route   GET /api/v1/dictionary/suggest
 * @access  Public
 */
const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    throw new ApiError(400, 'Query must be at least 2 characters');
  }

  // Check cache
  const cacheKey = `suggestions:${q.toLowerCase()}`;
  const cachedData = await cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      data: cachedData,
      cached: true,
    });
  }

  try {
    // Use DataMuse API for suggestions
    const response = await axios.get(`https://api.datamuse.com/sug`, {
      params: { s: q, max: 10 },
    });

    const suggestions = response.data.map((item) => item.word);

    // Cache for 1 hour
    await cache.set(cacheKey, suggestions, 3600);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch suggestions');
  }
});

/**
 * @desc    Get word of the day
 * @route   GET /api/v1/dictionary/word-of-day
 * @access  Public
 */
const getWordOfDay = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `word-of-day:${today}`;

  // Check cache
  const cachedData = await cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      data: cachedData,
      cached: true,
    });
  }

  try {
    // Use WordsAPI or similar service
    // For demo, we'll use a predefined list
    const words = [
      'serendipity',
      'ephemeral',
      'eloquent',
      'resilient',
      'ubiquitous',
      'paradigm',
      'meticulous',
      'ambiguous',
      'pragmatic',
      'inevitable',
    ];

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const wordOfDay = words[dayOfYear % words.length];

    // Fetch definition
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordOfDay}`);
    const data = response.data[0];

    const result = {
      word: data.word,
      phonetic: data.phonetic || null,
      meanings: data.meanings || [],
      date: today,
    };

    // Cache until end of day
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const ttl = Math.floor((endOfDay - now) / 1000);

    await cache.set(cacheKey, result, ttl);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch word of the day');
  }
});

/**
 * @desc    Save word to user's collection
 * @route   POST /api/v1/dictionary/save
 * @access  Private
 */
const saveWord = asyncHandler(async (req, res) => {
  const { word } = req.body;
  const userId = req.user.id;

  if (!word) {
    throw new ApiError(400, 'Word is required');
  }

  // This would save to user_saved_words table
  // Implementation depends on your model structure

  res.status(200).json({
    success: true,
    message: 'Word saved successfully',
    data: { word },
  });
});

/**
 * @desc    Get user's saved words
 * @route   GET /api/v1/dictionary/saved
 * @access  Private
 */
const getSavedWords = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  // This would fetch from user_saved_words table
  // Implementation depends on your model structure

  res.status(200).json({
    success: true,
    data: [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      totalPages: 0,
    },
  });
});

/**
 * @desc    Get user's search history
 * @route   GET /api/v1/dictionary/history
 * @access  Private
 */
const getSearchHistory = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const userId = req.user.id;

  // This would fetch from user_search_history table
  // Implementation depends on your model structure

  res.status(200).json({
    success: true,
    data: [],
  });
});

module.exports = {
  searchWord,
  getSuggestions,
  getWordOfDay,
  saveWord,
  getSavedWords,
  getSearchHistory,
};
