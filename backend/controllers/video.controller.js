const { VideoLesson, VideoSubtitle, User, UserVideoProgress } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const { sendMessage, parseAIResponse } = require('../services/geminiService');

/**
 * @desc    Get all video lessons
 * @route   GET /api/v1/videos
 * @access  Public
 */
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = 'created_at',
    order = 'DESC',
    search,
    level,
    category,
    is_published,
  } = req.query;

  // Build where clause
  const where = {};

  if (search) {
    where.title = { [Op.like]: `%${search}%` };
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
    // Default: only show published videos for non-admin
    if (!req.user || req.user.role !== 'admin') {
      where.is_published = true;
    }
  }

  // Filter by is_active for non-admin users
  if (!req.user || req.user.role !== 'admin') {
    where.is_active = true;
  }

  // Calculate pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Fetch videos
  const { count, rows: videos } = await VideoLesson.findAndCountAll({
    where,
    order: [[sort, order.toUpperCase()]],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    data: videos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single video lesson
 * @route   GET /api/v1/videos/:id
 * @access  Public
 */
const getVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await VideoLesson.findByPk(id, {
    include: [
      {
        model: VideoSubtitle,
        as: 'subtitles',
        order: [['sort_order', 'ASC']],
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'full_name'],
      },
    ],
  });

  if (!video) {
    throw new ApiError(404, 'Video lesson not found');
  }

  // Check if published
  if (!video.is_published && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(403, 'This video is not available');
  }

  // Check if active
  if (!video.is_active && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(403, 'This video is not available');
  }

  res.status(200).json({
    success: true,
    data: video,
  });
});

/**
 * @desc    Create new video lesson
 * @route   POST /api/v1/videos
 * @access  Private/Admin
 */
const createVideo = asyncHandler(async (req, res) => {
  const {
    title,
    youtube_id,
    video_url,
    thumbnail,
    level,
    category,
    duration_sec,
    is_published,
    is_active,
  } = req.body;

  const video = await VideoLesson.create({
    title,
    youtube_id,
    video_url,
    thumbnail,
    level,
    category,
    duration_sec,
    is_published: is_published || false,
    is_active: is_active !== undefined ? is_active : true,
    created_by: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: 'Video lesson created successfully',
    data: video,
  });
});

/**
 * @desc    Update video lesson
 * @route   PUT /api/v1/videos/:id
 * @access  Private/Admin
 */
const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    youtube_id,
    video_url,
    thumbnail,
    level,
    category,
    duration_sec,
    is_published,
  } = req.body;

  const video = await VideoLesson.findByPk(id);

  if (!video) {
    throw new ApiError(404, 'Video lesson not found');
  }

  // Update video
  if (title) video.title = title;
  if (youtube_id !== undefined) video.youtube_id = youtube_id;
  if (video_url !== undefined) video.video_url = video_url;
  if (thumbnail !== undefined) video.thumbnail = thumbnail;
  if (level) video.level = level;
  if (category !== undefined) video.category = category;
  if (duration_sec !== undefined) video.duration_sec = duration_sec;
  if (is_published !== undefined) video.is_published = is_published;

  await video.save();

  res.status(200).json({
    success: true,
    message: 'Video lesson updated successfully',
    data: video,
  });
});

/**
 * @desc    Delete video lesson
 * @route   DELETE /api/v1/videos/:id
 * @access  Private/Admin
 */
const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await VideoLesson.findByPk(id);

  if (!video) {
    throw new ApiError(404, 'Video lesson not found');
  }

  // Soft delete - unpublish
  video.is_published = false;
  await video.save();

  res.status(200).json({
    success: true,
    message: 'Video lesson unpublished successfully',
  });
});

/**
 * @desc    Add subtitles to video
 * @route   POST /api/v1/videos/:id/subtitles
 * @access  Private/Admin
 */
const addSubtitles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subtitles } = req.body;

  if (!Array.isArray(subtitles) || subtitles.length === 0) {
    throw new ApiError(400, 'Please provide an array of subtitles');
  }

  const video = await VideoLesson.findByPk(id);

  if (!video) {
    throw new ApiError(404, 'Video lesson not found');
  }

  // Create subtitles
  const createdSubtitles = await VideoSubtitle.bulkCreate(
    subtitles.map((sub, index) => ({
      video_id: id,
      start_time: sub.start_time,
      end_time: sub.end_time,
      text_en: sub.text_en,
      text_vi: sub.text_vi,
      sort_order: sub.sort_order || index,
    }))
  );

  res.status(201).json({
    success: true,
    message: 'Subtitles added successfully',
    data: createdSubtitles,
  });
});

/**
 * @desc    Update subtitle
 * @route   PUT /api/v1/videos/subtitles/:subtitleId
 * @access  Private/Admin
 */
const updateSubtitle = asyncHandler(async (req, res) => {
  const { subtitleId } = req.params;
  const { start_time, end_time, text_en, text_vi, sort_order } = req.body;

  const subtitle = await VideoSubtitle.findByPk(subtitleId);

  if (!subtitle) {
    throw new ApiError(404, 'Subtitle not found');
  }

  // Update subtitle
  if (start_time !== undefined) subtitle.start_time = start_time;
  if (end_time !== undefined) subtitle.end_time = end_time;
  if (text_en) subtitle.text_en = text_en;
  if (text_vi !== undefined) subtitle.text_vi = text_vi;
  if (sort_order !== undefined) subtitle.sort_order = sort_order;

  await subtitle.save();

  res.status(200).json({
    success: true,
    message: 'Subtitle updated successfully',
    data: subtitle,
  });
});

/**
 * @desc    Delete subtitle
 * @route   DELETE /api/v1/videos/subtitles/:subtitleId
 * @access  Private/Admin
 */
const deleteSubtitle = asyncHandler(async (req, res) => {
  const { subtitleId } = req.params;

  const subtitle = await VideoSubtitle.findByPk(subtitleId);

  if (!subtitle) {
    throw new ApiError(404, 'Subtitle not found');
  }

  await subtitle.destroy();

  res.status(200).json({
    success: true,
    message: 'Subtitle deleted successfully',
  });
});

/**
 * @desc    Check pronunciation
 * @route   POST /api/v1/videos/:id/pronunciation
 * @access  Private
 */
const checkPronunciation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subtitleId, spokenText } = req.body;
  const userId = req.user.id;

  if (!subtitleId || !spokenText) {
    throw new ApiError(400, 'Please provide subtitleId and spokenText');
  }

  // Get subtitle
  const subtitle = await VideoSubtitle.findOne({
    where: { id: subtitleId, video_id: id },
  });

  if (!subtitle) {
    throw new ApiError(404, 'Subtitle not found');
  }

  // Call AI to score pronunciation
  const prompt = `You are an English pronunciation teacher. Compare the student's spoken text with the correct text and score their pronunciation.

Correct text: "${subtitle.text_en}"
Student's spoken text: "${spokenText}"

Analyze:
1. Overall pronunciation accuracy (0-100)
2. Score each word individually
3. Identify mispronounced words
4. Provide feedback in Vietnamese

Return JSON:
{
  "score": 85,
  "passed": true,
  "wordScores": [
    {"word": "hello", "score": 90, "correct": true},
    {"word": "world", "score": 80, "correct": true}
  ],
  "feedback_vi": "Phát âm tốt! Cần chú ý phát âm từ 'world' rõ ràng hơn."
}

Pass threshold: 70`;

  try {
    let result;
    try {
      const response = await sendMessage([], '', prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      });
      result = parseAIResponse(response);
    } catch (aiError) {
      console.error('AI Service Error (Pronunciation):', aiError.message);
      // Fallback result when AI is down
      result = {
        score: 100,
        passed: true,
        wordScores: [],
        feedback_vi: "Hệ thống AI hiện không hoạt động. Bạn được tự động cho qua phần này để tiếp tục bài học."
      };
      console.log('AI không hoạt động - Chế độ tự động vượt qua kích hoạt');
    }

    // Get or create progress
    let progress = await UserVideoProgress.findOne({
      where: { user_id: userId, video_id: id },
    });

    if (!progress) {
      progress = await UserVideoProgress.create({
        user_id: userId,
        video_id: id,
        completed_segments: [],
        pronunciation_scores: {},
        dictation_answers: {},
      });
    }

    // Update pronunciation scores
    const pronunciationScores = progress.pronunciation_scores || {};
    pronunciationScores[subtitleId] = {
      score: result.score,
      passed: result.passed,
      timestamp: new Date(),
    };
    progress.pronunciation_scores = pronunciationScores;

    // Add XP if passed
    let xpEarned = 0;
    if (result.passed) {
      xpEarned = 10; // XP for pronunciation
      const user = await User.findByPk(userId);
      user.xp += xpEarned;
      await user.save();

      // Mark segment as completed
      const completedSegments = progress.completed_segments || [];
      if (!completedSegments.includes(subtitleId)) {
        completedSegments.push(subtitleId);
        progress.completed_segments = completedSegments;
      }
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: {
        score: result.score,
        wordScores: result.wordScores || [],
        feedback_vi: result.feedback_vi,
        passed: result.passed,
        xpEarned,
      },
    });
  } catch (error) {
    console.error('Pronunciation check error:', error);
    throw new ApiError(500, 'Failed to check pronunciation');
  }
});

/**
 * @desc    Check dictation
 * @route   POST /api/v1/videos/:id/dictation
 * @access  Private
 */
const checkDictation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subtitleId, studentAnswer } = req.body;
  const userId = req.user.id;

  if (!subtitleId || !studentAnswer) {
    throw new ApiError(400, 'Please provide subtitleId and studentAnswer');
  }

  // Get subtitle
  const subtitle = await VideoSubtitle.findOne({
    where: { id: subtitleId, video_id: id },
  });

  if (!subtitle) {
    throw new ApiError(404, 'Subtitle not found');
  }

  // Call AI to check dictation
  const prompt = `You are an English dictation teacher. Compare the student's answer with the correct text.

Correct text: "${subtitle.text_en}"
Student's answer: "${studentAnswer}"

Analyze:
1. Calculate accuracy score (0-100)
2. Identify correct and incorrect words
3. Create highlighted answer (wrap incorrect words in <error>word</error>)
4. Provide feedback in Vietnamese

Return JSON:
{
  "score": 85,
  "isCorrect": true,
  "highlightedAnswer": "Hello <error>wrold</error>",
  "feedback_vi": "Tốt lắm! Chỉ sai chính tả từ 'world'.",
  "correctAnswer": "Hello world"
}

Pass threshold: 70`;

  try {
    let result;
    try {
      const response = await sendMessage([], '', prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      });
      result = parseAIResponse(response);
    } catch (aiError) {
      console.error('AI Service Error (Dictation):', aiError.message);
      // Fallback result when AI is down
      result = {
        score: 100,
        isCorrect: true,
        highlightedAnswer: studentAnswer,
        feedback_vi: "Hệ thống AI hiện không hoạt động. Đáp án của bạn đã được chấp nhận tự động.",
        correctAnswer: subtitle.text_en
      };
      console.log('AI không hoạt động - Chế độ tự động vượt qua kích hoạt');
    }

    // Get or create progress
    let progress = await UserVideoProgress.findOne({
      where: { user_id: userId, video_id: id },
    });

    if (!progress) {
      progress = await UserVideoProgress.create({
        user_id: userId,
        video_id: id,
        completed_segments: [],
        pronunciation_scores: {},
        dictation_answers: {},
      });
    }

    // Update dictation answers
    const dictationAnswers = progress.dictation_answers || {};
    dictationAnswers[subtitleId] = {
      answer: studentAnswer,
      score: result.score,
      isCorrect: result.isCorrect,
      timestamp: new Date(),
    };
    progress.dictation_answers = dictationAnswers;

    // Add XP if correct
    let xpEarned = 0;
    if (result.isCorrect) {
      xpEarned = 15; // XP for dictation
      const user = await User.findByPk(userId);
      user.xp += xpEarned;
      await user.save();

      // Mark segment as completed
      const completedSegments = progress.completed_segments || [];
      if (!completedSegments.includes(subtitleId)) {
        completedSegments.push(subtitleId);
        progress.completed_segments = completedSegments;
      }
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: {
        score: result.score,
        isCorrect: result.isCorrect,
        highlightedAnswer: result.highlightedAnswer,
        feedback_vi: result.feedback_vi,
        correctAnswer: result.correctAnswer || subtitle.text_en,
        xpEarned,
      },
    });
  } catch (error) {
    console.error('Dictation check error:', error);
    throw new ApiError(500, 'Failed to check dictation');
  }
});

/**
 * @desc    Save video progress
 * @route   POST /api/v1/videos/:id/progress
 * @access  Private
 */
const saveProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentTime, completedSegments } = req.body;
  const userId = req.user.id;

  // Get or create progress
  let progress = await UserVideoProgress.findOne({
    where: { user_id: userId, video_id: id },
  });

  if (!progress) {
    progress = await UserVideoProgress.create({
      user_id: userId,
      video_id: id,
      current_time: currentTime || 0,
      completed_segments: completedSegments || [],
      pronunciation_scores: {},
      dictation_answers: {},
    });
  } else {
    if (currentTime !== undefined) {
      progress.current_time = currentTime;
    }
    if (completedSegments) {
      progress.completed_segments = completedSegments;
    }
  }

  // Check if video is completed
  const video = await VideoLesson.findByPk(id, {
    include: [{ model: VideoSubtitle, as: 'subtitles' }],
  });

  const totalSegments = video.subtitles.length;
  const completedCount = (progress.completed_segments || []).length;
  const isCompleted = completedCount >= totalSegments;

  if (isCompleted && !progress.is_completed) {
    progress.is_completed = true;
    progress.completed_at = new Date();

    // Award completion XP
    const user = await User.findByPk(userId);
    user.xp += 50; // Completion bonus
    await user.save();
  }

  await progress.save();

  res.status(200).json({
    success: true,
    data: {
      saved: true,
      isCompleted,
      totalXp: isCompleted ? 50 : 0,
      progress: {
        currentTime: progress.current_time,
        completedSegments: progress.completed_segments,
        completedCount,
        totalSegments,
      },
    },
  });
});

/**
 * @desc    Get video progress
 * @route   GET /api/v1/videos/:id/progress
 * @access  Private
 */
const getProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const progress = await UserVideoProgress.findOne({
    where: { user_id: userId, video_id: id },
  });

  if (!progress) {
    return res.status(200).json({
      success: true,
      data: {
        currentTime: 0,
        completedSegments: [],
        isCompleted: false,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      currentTime: progress.current_time,
      completedSegments: progress.completed_segments,
      pronunciationScores: progress.pronunciation_scores,
      dictationAnswers: progress.dictation_answers,
      isCompleted: progress.is_completed,
      completedAt: progress.completed_at,
    },
  });
});

module.exports = {
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
};
