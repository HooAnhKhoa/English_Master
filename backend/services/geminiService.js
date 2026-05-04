const { getModel } = require('../config/gemini');
require('dotenv').config();

/**
 * Send message to Gemini with conversation history
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} systemPrompt - System prompt for AI behavior
 * @param {string} userMessage - Current user message
 * @param {object} options - Additional options
 * @returns {Promise<string>} - AI response
 */
async function sendMessage(conversationHistory, systemPrompt, userMessage, options = {}) {
  try {
    const model = getModel(options.model);

    // Prepend system prompt to the first user message
    const fullUserMessage = conversationHistory.length === 0
      ? `${systemPrompt}\n\nUser: ${userMessage}`
      : userMessage;

    // Filter history to match Gemini format
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Ensure history starts with 'user' role (Gemini requirement)
    if (history.length > 0 && history[0].role === 'model') {
      // Remove the first model message or prepend a user message
      history.shift();
    }

    // Start a chat session
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: options.temperature || parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
        maxOutputTokens: options.maxTokens || parseInt(process.env.GEMINI_MAX_TOKENS) || 1000,
      }
    });

    const result = await chat.sendMessage(fullUserMessage);
    const rawResponse = result.response.text();

    // Log raw response for debugging
    console.log('Raw Gemini response:', rawResponse.substring(0, 200));

    return rawResponse;
  } catch (error) {
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      throw new Error('AUTH_ERROR: Invalid Gemini API key.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('TIMEOUT: Request to Gemini timed out.');
    }

    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

/**
 * Parse AI response with fallback for non-JSON responses
 * @param {string} rawResponse - Raw response from Gemini
 * @returns {object} - Parsed response object
 */
function parseAIResponse(rawResponse) {
  try {
    // If it's empty, return default
    if (!rawResponse) {
      return createDefaultResponse("Sorry, I didn't catch that.");
    }

    // Log for debugging
    console.log('Parsing response, length:', rawResponse.length);

    // First, try to extract JSON from markdown code blocks
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      console.log('Found JSON in markdown block');
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error('Failed to parse JSON from markdown:', e.message);
      }
    }

    // Try direct JSON parse
    try {
      const parsed = JSON.parse(rawResponse);
      console.log('Successfully parsed as direct JSON');
      return parsed;
    } catch (e) {
      console.log('Not direct JSON, trying to fix...');
    }

    // Try to fix truncated JSON by adding closing brackets
    let fixedResponse = rawResponse.trim();
    const openBraces = (fixedResponse.match(/{/g) || []).length;
    const closeBraces = (fixedResponse.match(/}/g) || []).length;
    const openBrackets = (fixedResponse.match(/\[/g) || []).length;
    const closeBrackets = (fixedResponse.match(/\]/g) || []).length;

    if (openBraces > closeBraces || openBrackets > closeBrackets) {
      console.warn('JSON appears truncated, attempting to fix...');

      // Close any open string
      const quoteCount = (fixedResponse.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        fixedResponse += '"';
      }

      // Close arrays and objects
      for (let i = 0; i < (openBrackets - closeBrackets); i++) {
        fixedResponse += ']';
      }
      for (let i = 0; i < (openBraces - closeBraces); i++) {
        fixedResponse += '}';
      }

      try {
        const parsed = JSON.parse(fixedResponse);
        console.log('Successfully parsed fixed JSON');
        return parsed;
      } catch (e) {
        console.error('Failed to parse fixed JSON:', e.message);
      }
    }

    // If all parsing fails, return a safe structure
    console.warn('All parsing failed, returning safe structure');
    console.log('Raw response sample:', rawResponse.substring(0, 300));
    return createDefaultResponse(rawResponse);
  } catch (error) {
    console.error('Parse error:', error);
    return createDefaultResponse(rawResponse || 'Error occurred');
  }
}

function createDefaultResponse(text) {
  return {
    reply: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
    correction: null,
    vocabulary: [],
    suggestedResponses: ["How interesting!", "Tell me more.", "I see."],
    grammarErrors: [],
    score: null,
  };
}

/**
 * Transcribe speech to text (Note: Gemini doesn't have native speech-to-text)
 * This is a placeholder - you may need to use Google Cloud Speech-to-Text API
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} filename - Original filename (for format detection)
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeSpeech(audioBuffer, filename = 'audio.webm') {
  throw new Error('Speech transcription not implemented. Please use Google Cloud Speech-to-Text API or another service.');
}

/**
 * Get MIME type from filename
 * @param {string} filename - Filename with extension
 * @returns {string} - MIME type
 */
function getAudioMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'webm': 'audio/webm',
    'mp3': 'audio/mpeg',
    'mp4': 'audio/mp4',
    'm4a': 'audio/mp4',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
  };
  return mimeTypes[ext] || 'audio/webm';
}

/**
 * Generate system prompt from template
 * @param {object} params - Template parameters
 * @returns {string} - Generated system prompt
 */
function generateSystemPrompt(params) {
  const {
    userLevel = 'intermediate',
    scenario = 'daily_conversation',
    topic = 'general',
    userName = 'Student',
  } = params;

  const scenarioDescriptions = {
    job_interview: 'conducting a job interview',
    ordering_food: 'helping a customer order food at a restaurant',
    travel: 'assisting a guest at a hotel reception',
    shopping: 'helping a customer in a shop',
    daily_conversation: 'having a casual daily conversation',
    business_meeting: 'participating in a business meeting',
    making_friends: 'making new friends',
  };

  const scenarioDesc = scenarioDescriptions[scenario] || scenarioDescriptions.daily_conversation;

  return `You are an encouraging English teacher having a conversation with ${userName}, a ${userLevel} level English learner.

SCENARIO: You are ${scenarioDesc}${topic !== 'general' ? ` about ${topic}` : ''}.

YOUR ROLE:
- Respond naturally and conversationally
- Use vocabulary and grammar appropriate for ${userLevel} level
- Gently correct mistakes by modeling correct usage
- Encourage the student with positive feedback
- Ask follow-up questions to keep the conversation flowing

Return ONLY valid JSON:
{
  "reply": "Your conversational response (2-3 sentences)",
  "correction": "Gentle correction if needed (null if no errors)",
  "vocabulary": [{"word": "...", "meaning": "...", "example": "..."}],
  "suggestedResponses": ["Response option 1", "Response option 2", "Response option 3"],
  "grammarErrors": [{"error": "...", "correction": "...", "explanation": "..."}],
  "score": 0-100 (rate the student's message quality)
}

IMPORTANT RULES:
- Keep reply short (2-3 sentences max)
- Provide max 2-3 vocabulary items
- ALWAYS provide exactly 3 DIFFERENT suggestedResponses
- Each suggestion must be UNIQUE and offer a different way to continue
- Vary suggestions: one agreeing/confirming, one asking a question, one sharing experience/opinion
- Make suggestions natural, contextually relevant, and appropriate for ${userLevel} level
- Score based on grammar accuracy, vocabulary usage, and fluency`;
}

/**
 * Analyze grammar with detailed feedback
 * @param {string} text - User text to analyze
 * @param {string} level - User's English level
 * @returns {Promise<object>} - Grammar analysis
 */
async function analyzeGrammar(text, level = 'intermediate') {
  try {
    const prompt = `Analyze this English text for grammar, vocabulary, and fluency. User level: ${level}

Text: "${text}"

Provide detailed feedback in JSON format:
{
  "hasErrors": boolean,
  "errors": [{"original": "...", "correction": "...", "explanation": "...", "type": "grammar|vocabulary|spelling"}],
  "suggestions": ["improvement suggestion 1", "suggestion 2"],
  "score": 0-100,
  "strengths": ["what they did well"],
  "vocabulary": [{"word": "...", "meaning": "...", "level": "..."}]
}`;

    const response = await sendMessage([], '', prompt, {
      jsonMode: true,
      temperature: 0.3,
      maxTokens: 1000,
    });

    return parseAIResponse(response);
  } catch (error) {
    console.error('Grammar analysis error:', error);
    throw error;
  }
}

/**
 * Generate conversation scenario opening
 * @param {string} scenario - Scenario type
 * @param {string} level - User level
 * @param {string} topic - Optional topic
 * @returns {Promise<object>} - Opening message with suggestions
 */
async function generateScenarioOpening(scenario, level = 'intermediate', topic = null) {
  try {
    const systemPrompt = generateSystemPrompt({ userLevel: level, scenario, topic });

    const openingPrompt = 'Start the conversation with a friendly greeting and opening question.';

    const response = await sendMessage([], systemPrompt, openingPrompt, {
      jsonMode: true,
      temperature: 0.8,
      maxTokens: 500,
    });

    return parseAIResponse(response);
  } catch (error) {
    console.error('Scenario generation error:', error);
    throw error;
  }
}

module.exports = {
  sendMessage,
  parseAIResponse,
  transcribeSpeech,
  generateSystemPrompt,
  analyzeGrammar,
  generateScenarioOpening,
};
