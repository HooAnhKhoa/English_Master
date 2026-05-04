const { Exercise, Lesson } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Get all exercises for a lesson
 * @route   GET /api/v1/exercises?lesson_id=:lessonId
 * @access  Public
 */
const getAllExercises = asyncHandler(async (req, res) => {
  const { lesson_id, type, difficulty } = req.query;

  if (!lesson_id) {
    throw new ApiError(400, 'Lesson ID is required');
  }

  // Build where clause
  const where = { lesson_id };

  if (type) {
    where.type = type;
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  // Fetch exercises
  const exercises = await Exercise.findAll({
    where,
    attributes: { exclude: ['correct_answer'] }, // Hide correct answer
    order: [['sort_order', 'ASC']],
  });

  res.status(200).json({
    success: true,
    data: exercises,
  });
});

/**
 * @desc    Get single exercise
 * @route   GET /api/v1/exercises/:id
 * @access  Public
 */
const getExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exercise = await Exercise.findByPk(id, {
    attributes: { exclude: ['correct_answer'] },
    include: [
      {
        model: Lesson,
        as: 'lesson',
        attributes: ['id', 'title', 'level'],
      },
    ],
  });

  if (!exercise) {
    throw new ApiError(404, 'Exercise not found');
  }

  res.status(200).json({
    success: true,
    data: exercise,
  });
});

/**
 * @desc    Create new exercise
 * @route   POST /api/v1/exercises
 * @access  Private/Admin
 */
const createExercise = asyncHandler(async (req, res) => {
  const {
    lesson_id,
    type,
    question,
    question_audio,
    options,
    correct_answer,
    explanation,
    points,
    difficulty,
    sort_order,
  } = req.body;

  // Check if lesson exists
  const lesson = await Lesson.findByPk(lesson_id);

  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  // Create exercise
  const exercise = await Exercise.create({
    lesson_id,
    type,
    question,
    question_audio,
    options,
    correct_answer,
    explanation,
    points: points || 10,
    difficulty: difficulty || 'medium',
    sort_order: sort_order || 0,
  });

  res.status(201).json({
    success: true,
    message: 'Exercise created successfully',
    data: exercise,
  });
});

/**
 * @desc    Update exercise
 * @route   PUT /api/v1/exercises/:id
 * @access  Private/Admin
 */
const updateExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    type,
    question,
    question_audio,
    options,
    correct_answer,
    explanation,
    points,
    difficulty,
    sort_order,
  } = req.body;

  const exercise = await Exercise.findByPk(id);

  if (!exercise) {
    throw new ApiError(404, 'Exercise not found');
  }

  // Update exercise
  if (type) exercise.type = type;
  if (question) exercise.question = question;
  if (question_audio !== undefined) exercise.question_audio = question_audio;
  if (options !== undefined) exercise.options = options;
  if (correct_answer) exercise.correct_answer = correct_answer;
  if (explanation !== undefined) exercise.explanation = explanation;
  if (points !== undefined) exercise.points = points;
  if (difficulty) exercise.difficulty = difficulty;
  if (sort_order !== undefined) exercise.sort_order = sort_order;

  await exercise.save();

  res.status(200).json({
    success: true,
    message: 'Exercise updated successfully',
    data: exercise,
  });
});

/**
 * @desc    Delete exercise
 * @route   DELETE /api/v1/exercises/:id
 * @access  Private/Admin
 */
const deleteExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exercise = await Exercise.findByPk(id);

  if (!exercise) {
    throw new ApiError(404, 'Exercise not found');
  }

  await exercise.destroy();

  res.status(200).json({
    success: true,
    message: 'Exercise deleted successfully',
  });
});

/**
 * @desc    Submit exercise answer
 * @route   POST /api/v1/exercises/:id/submit
 * @access  Private
 */
const submitAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  if (!answer) {
    throw new ApiError(400, 'Answer is required');
  }

  const exercise = await Exercise.findByPk(id);

  if (!exercise) {
    throw new ApiError(404, 'Exercise not found');
  }

  // Check answer
  const isCorrect = exercise.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();

  // Calculate score
  const score = isCorrect ? exercise.points : 0;

  res.status(200).json({
    success: true,
    data: {
      is_correct: isCorrect,
      correct_answer: exercise.correct_answer,
      explanation: exercise.explanation,
      points_earned: score,
    },
  });
});

module.exports = {
  getAllExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  submitAnswer,
};
