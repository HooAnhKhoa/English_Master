const express = require('express');
const router = express.Router();
const {
  getAllVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  addSubtitles,
  updateSubtitle,
  deleteSubtitle,
  checkPronunciation,
  checkDictation,
  saveProgress,
  getProgress,
} = require('../controllers/video.controller');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// Validation rules
const createVideoValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('level')
    .notEmpty()
    .withMessage('Level is required')
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Invalid level'),
  body('youtube_id')
    .optional()
    .isLength({ max: 20 })
    .withMessage('YouTube ID must not exceed 20 characters'),
  body('video_url')
    .optional()
    .isURL()
    .withMessage('Invalid video URL'),
];

const updateVideoValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('level')
    .optional()
    .isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Invalid level'),
  body('youtube_id')
    .optional()
    .isLength({ max: 20 })
    .withMessage('YouTube ID must not exceed 20 characters'),
  body('video_url')
    .optional()
    .isURL()
    .withMessage('Invalid video URL'),
  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),
];

const addSubtitlesValidation = [
  body('subtitles')
    .isArray({ min: 1 })
    .withMessage('Subtitles must be a non-empty array'),
  body('subtitles.*.start_time')
    .notEmpty()
    .withMessage('Start time is required')
    .isFloat({ min: 0 })
    .withMessage('Start time must be a positive number'),
  body('subtitles.*.end_time')
    .notEmpty()
    .withMessage('End time is required')
    .isFloat({ min: 0 })
    .withMessage('End time must be a positive number'),
  body('subtitles.*.text_en')
    .trim()
    .notEmpty()
    .withMessage('English text is required'),
];

const updateSubtitleValidation = [
  body('start_time')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Start time must be a positive number'),
  body('end_time')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('End time must be a positive number'),
  body('text_en')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('English text cannot be empty'),
];

// Routes
router.get('/', optionalAuth, getAllVideos);
router.get('/:id', optionalAuth, getVideo);
router.post('/', verifyToken, isAdmin, createVideoValidation, validate, createVideo);
router.put('/:id', verifyToken, isAdmin, updateVideoValidation, validate, updateVideo);
router.delete('/:id', verifyToken, isAdmin, deleteVideo);
router.post('/:id/subtitles', verifyToken, isAdmin, addSubtitlesValidation, validate, addSubtitles);
router.put('/subtitles/:subtitleId', verifyToken, isAdmin, updateSubtitleValidation, validate, updateSubtitle);
router.delete('/subtitles/:subtitleId', verifyToken, isAdmin, deleteSubtitle);

// Learning routes
router.post('/:id/pronunciation', verifyToken, checkPronunciation);
router.post('/:id/dictation', verifyToken, checkDictation);
router.post('/:id/progress', verifyToken, saveProgress);
router.get('/:id/progress', verifyToken, getProgress);

module.exports = router;
