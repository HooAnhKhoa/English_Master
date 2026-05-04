const { AIConversation, AIMessage, User, Badge } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const {
  sendMessage,
  parseAIResponse,
  transcribeSpeech,
  generateSystemPrompt,
  generateScenarioOpening,
  analyzeGrammar,
} = require('../services/geminiService');
const multer = require('multer');
const path = require('path');

// Configure multer for audio uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /webm|mp3|wav|ogg|m4a|mp4/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed (webm, mp3, wav, ogg, m4a, mp4)'));
    }
  },
}).single('audio');

// Fallback content when AI is down
const FALLBACK_SCENARIOS = {
  daily_conversation: {
    reply: "Hello! I'm your English practice partner. How has your day been so far?",
    suggestions: ["My day has been great!", "It's been a busy day.", "Not too bad, thanks for asking."],
    vocab: [{ word: "productive", meaning: "làm việc hiệu quả", example: "I had a very productive day." }]
  },
  job_interview: {
    reply: "Welcome to the interview. To start, could you please tell me a little bit about yourself and your professional background?",
    suggestions: ["I have 3 years of experience in marketing.", "I recently graduated from university.", "I'm looking for new challenges."],
    vocab: [{ word: "background", meaning: "nền tảng/kinh nghiệm", example: "Tell me about your educational background." }]
  },
  ordering_food: {
    reply: "Good evening! Welcome to our restaurant. Are you ready to order, or do you need a few more minutes?",
    suggestions: ["I'm ready to order now.", "Could I have a few more minutes?", "What do you recommend?"],
    vocab: [{ word: "recommend", meaning: "gợi ý/giới thiệu", example: "What dish do you recommend?" }]
  },
  travel: {
    reply: "Hello! Welcome to the Grand Hotel. How can I assist you with your travel plans today?",
    suggestions: ["I'd like to check in, please.", "Do you have any city maps?", "Where is the nearest bus station?"],
    vocab: [{ word: "check-in", meaning: "nhận phòng", example: "What time is check-in?" }]
  }
};

/**
 * @desc    Start new AI conversation
 * @route   POST /api/v1/ai/conversations
 * @access  Private
 */
const startConversation = asyncHandler(async (req, res) => {
  const { topic, scenario } = req.body;
  const userId = req.user.id;
  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Create conversation
  const conversation = await AIConversation.create({
    user_id: userId,
    topic: topic || null,
    scenario: scenario || 'daily_conversation',
    level: user.level,
  });

  try {
    let openingResponse;
    try {
      // Generate opening message with AI
      openingResponse = await generateScenarioOpening(
        scenario || 'daily_conversation',
        user.level,
        topic
      );
    } catch (aiError) {
      console.error('AI Service Error (Start Conversation):', aiError.message);
      console.log('AI KHÔNG HOẠT ĐỘNG - Sử dụng kịch bản soạn sẵn cho scenario:', scenario);

      const fallback = FALLBACK_SCENARIOS[scenario] || FALLBACK_SCENARIOS.daily_conversation;
      openingResponse = {
        reply: fallback.reply,
        suggestedResponses: fallback.suggestions,
        vocabulary: fallback.vocab
      };
    }

    // Save AI opening message
    await AIMessage.create({
      conversation_id: conversation.id,
      role: 'assistant',
      content: openingResponse.reply || 'Hello! How can I help you today?',
    });

    // Update conversation turn count
    conversation.total_turns = 1;
    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'Conversation started successfully',
      data: {
        conversationId: conversation.id,
        firstMessage: openingResponse.reply,
        suggestedResponses: openingResponse.suggestedResponses || ["Hello!", "Hi there!"],
        scenario: conversation.scenario,
        topic: conversation.topic,
        isFallback: true // Indicate this might be fallback content
      },
    });
  } catch (error) {
    // Clean up conversation if DB fails
    if (conversation) await conversation.destroy();
    throw error;
  }
});

/**
 * @desc    Send message in conversation
 * @route   POST /api/v1/ai/conversations/:id/messages
 * @access  Private
 */
const sendMessageHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { content } = req.body;
  const userId = req.user.id;

  // Handle audio upload if present
  if (req.file) {
    try {
      content = await transcribeSpeech(req.file.buffer, req.file.originalname);
    } catch (error) {
      console.error('Transcription error:', error.message);
      // If transcription fails, we can't really continue with audio
      throw new ApiError(500, `AI không hoạt động: Không thể nhận diện giọng nói.`);
    }
  }

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, 'Message content is required');
  }

  // Get conversation with recent messages
  const conversation = await AIConversation.findOne({
    where: { id, user_id: userId },
    include: [
      {
        model: AIMessage,
        as: 'messages',
        order: [['created_at', 'ASC']],
        limit: 20, // Last 20 messages for context
      },
    ],
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  try {
    // Build conversation history
    const conversationHistory = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let aiResult;
    try {
      // Generate system prompt
      const systemPrompt = generateSystemPrompt({
        userLevel: conversation.level,
        scenario: conversation.scenario,
        topic: conversation.topic || 'general',
      });

      // Get AI response
      const aiResponseRaw = await sendMessage(conversationHistory, systemPrompt, content, {
        jsonMode: true,
        temperature: 0.7,
      });

      aiResult = parseAIResponse(aiResponseRaw);
    } catch (aiError) {
      console.error('AI Service Error (Message):', aiError.message);
      console.log('AI KHÔNG HOẠT ĐỘNG - Sử dụng phản hồi ngẫu nhiên');

      const fallbacks = [
        "That's very interesting! Can you tell me more about that?",
        "I understand. How does that make you feel?",
        "That's a good point. What else would you like to discuss regarding this?",
        "I see! Thanks for sharing that with me. What's next?"
      ];

      aiResult = {
        reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        correction: null,
        vocabulary: [],
        suggestedResponses: ["Let's talk more.", "What do you think?", "Can we change the topic?"],
        grammarErrors: [],
        score: 100
      };
    }

    // Save user message
    await AIMessage.create({
      conversation_id: conversation.id,
      role: 'user',
      content: content,
      audio_url: req.file ? `/uploads/audio/${req.file.filename}` : null,
      grammar_errors: aiResult.grammarErrors || [],
      suggestions: aiResult.suggestedResponses || [],
      turn_score: aiResult.score || 100,
    });

    // Save AI response message
    await AIMessage.create({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResult.reply,
    });

    // Update conversation
    conversation.total_turns += 2;
    await conversation.save();

    // Award XP
    const user = await User.findByPk(userId);
    user.xp += 10;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        reply: aiResult.reply,
        correction: aiResult.correction,
        vocabulary: aiResult.vocabulary || [],
        suggestedResponses: aiResult.suggestedResponses || [],
        grammarErrors: aiResult.grammarErrors || [],
        turnScore: aiResult.score || 100,
        xpEarned: 10,
        transcribedText: req.file ? content : null,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    throw new ApiError(500, `Lỗi hệ thống: ${error.message}`);
  }
});

/**
 * @desc    End conversation and calculate final score
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
        required: false,
      },
    ],
  });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const userMessages = conversation.messages || [];
  const scores = userMessages.map((msg) => msg.turn_score).filter((score) => score !== null);
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;

  conversation.overall_score = overallScore;
  await conversation.save();

  // Award completion XP
  const user = await User.findByPk(userId);
  user.xp += 50;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      scorecard: {
        overallScore,
        totalTurns: conversation.total_turns,
        xpTotal: 50
      }
    }
  });
});

const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const conversation = await AIConversation.findOne({
    where: { id, user_id: userId },
    include: [{ model: AIMessage, as: 'messages', order: [['created_at', 'ASC']] }],
  });
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  res.status(200).json({ success: true, data: conversation });
});

const getAllConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversations = await AIConversation.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
  });
  res.status(200).json({ success: true, data: conversations });
});

const analyzeText = asyncHandler(async (req, res) => {
  const { text } = req.body;
  try {
    const analysis = await analyzeGrammar(text);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: { reply: "AI không hoạt động. Bạn viết tốt lắm!", score: 100 }
    });
  }
});

module.exports = {
  startConversation,
  sendMessage: sendMessageHandler,
  getConversation,
  getAllConversations,
  endConversation,
  analyzeText,
  upload,
};
