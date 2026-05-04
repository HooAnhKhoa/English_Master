const { AIConversation, AIMessage, User } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { generateScenarioOpening, analyzeGrammar, sendMessage: sendAIMessage, parseAIResponse, generateSystemPrompt } = require('../services/geminiService');

/**
 * @desc    Start new AI conversation
 * @route   POST /api/v1/ai/conversations
 * @access  Private
 */
const startConversation = asyncHandler(async (req, res) => {
  const { topic, scenario, level } = req.body;
  const userId = req.user.id;

  // Create conversation
  const conversation = await AIConversation.create({
    user_id: userId,
    topic,
    scenario: scenario || 'daily_conversation',
    level: level || req.user.level,
  });

  // Generate initial AI message
  const initialResponse = await generateScenarioOpening(scenario || 'daily_conversation', level || req.user.level, topic);
  const initialMessage = initialResponse.reply || 'Hello! How can I help you today?';

  // Save AI message
  await AIMessage.create({
    conversation_id: conversation.id,
    role: 'assistant',
    content: initialMessage,
  });

  conversation.total_turns = 1;
  await conversation.save();

  res.status(201).json({
    success: true,
    message: 'Conversation started successfully',
    data: {
      conversation_id: conversation.id,
      initial_message: initialMessage,
    },
  });
});

/**
 * @desc    Send message in conversation
 * @route   POST /api/v1/ai/conversations/:id/messages
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, audio_url } = req.body;
  const userId = req.user.id;

  if (!content) {
    throw new ApiError(400, 'Message content is required');
  }

  // Get conversation
  const conversation = await AIConversation.findOne({
    where: { id, user_id: userId },
    include: [
      {
        model: AIMessage,
        as: 'messages',
        order: [['created_at', 'ASC']],
        limit: 10, // Last 10 messages for context
      },
    ],
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Analyze grammar
  const grammarAnalysis = await analyzeGrammar(content, conversation.level);

  // Save user message
  const userMessage = await AIMessage.create({
    conversation_id: conversation.id,
    role: 'user',
    content,
    audio_url,
    grammar_errors: grammarAnalysis.errors || [],
    suggestions: grammarAnalysis.suggestions || [],
    turn_score: grammarAnalysis.score || null,
  });

  // Build conversation history for AI
  const conversationHistory = conversation.messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const systemPrompt = `You are an English teacher having a conversation with a ${conversation.level} level student. The scenario is: ${conversation.scenario}. Provide natural, encouraging responses and gently correct mistakes.`;

  // Generate AI response
  const aiResponseRaw = await sendAIMessage(conversationHistory, systemPrompt, content, {
    temperature: 0.7,
  });

  const aiResponse = typeof aiResponseRaw === 'string' ? aiResponseRaw : aiResponseRaw.reply || aiResponseRaw;

  // Save AI message
  await AIMessage.create({
    conversation_id: conversation.id,
    role: 'assistant',
    content: aiResponse,
  });

  // Update conversation
  conversation.total_turns += 2;
  await conversation.save();

  // Award XP
  const user = await User.findByPk(userId);
  user.xp += 8; // XP per conversation turn
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      user_message: userMessage,
      ai_response: aiResponse,
      grammar_analysis: grammarAnalysis,
    },
  });
});

/**
 * @desc    Get conversation history
 * @route   GET /api/v1/ai/conversations/:id
 * @access  Private
 */
const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const conversation = await AIConversation.findOne({
    where: { id, user_id: userId },
    include: [
      {
        model: AIMessage,
        as: 'messages',
        order: [['created_at', 'ASC']],
      },
    ],
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

/**
 * @desc    Get all user conversations
 * @route   GET /api/v1/ai/conversations
 * @access  Private
 */
const getAllConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows: conversations } = await AIConversation.findAndCountAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.status(200).json({
    success: true,
    data: conversations,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * @desc    End conversation and calculate score
 * @route   POST /api/v1/ai/conversations/:id/end
 * @access  Private
 */
const endConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const conversation = await AIConversation.findOne({
    where: { id, user_id: userId },
    include: [
      {
        model: AIMessage,
        as: 'messages',
        where: { role: 'user' },
      },
    ],
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Calculate overall score (average of turn scores)
  const userMessages = conversation.messages;
  const scores = userMessages.map((msg) => msg.turn_score).filter((score) => score !== null);

  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Calculate duration
  const startTime = new Date(conversation.created_at);
  const endTime = new Date();
  const durationSec = Math.floor((endTime - startTime) / 1000);

  // Update conversation
  conversation.overall_score = overallScore;
  conversation.duration_sec = durationSec;
  await conversation.save();

  res.status(200).json({
    success: true,
    message: 'Conversation ended successfully',
    data: {
      overall_score: overallScore,
      duration_sec: durationSec,
      total_turns: conversation.total_turns,
    },
  });
});

/**
 * @desc    Analyze text grammar
 * @route   POST /api/v1/ai/analyze
 * @access  Private
 */
const analyzeText = asyncHandler(async (req, res) => {
  const { text, level } = req.body;

  if (!text) {
    throw new ApiError(400, 'Text is required');
  }

  const analysis = await analyzeGrammar(text, level || req.user.level);

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

module.exports = {
  startConversation,
  sendMessage,
  getConversation,
  getAllConversations,
  endConversation,
  analyzeText,
};
