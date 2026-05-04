const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Send message to OpenAI with conversation history
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} systemPrompt - System prompt for AI behavior
 * @param {string} userMessage - Current user message
 * @param {object} options - Additional options
 * @returns {Promise<string>} - AI response
 */
async function sendMessage(conversationHistory, systemPrompt, userMessage, options = {}) {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages,
      max_tokens: options.maxTokens || parseInt(process.env.OPENAI_MAX_TOKENS) || 1500,
      temperature: options.temperature || parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
      ...options,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    // Handle specific OpenAI errors
    if (error.status === 429) {
      throw new Error('RATE_LIMIT: OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.status === 401) {
      throw new Error('AUTH_ERROR: Invalid OpenAI API key.');
    } else if (error.status === 500 || error.status === 503) {
      throw new Error('SERVICE_ERROR: OpenAI service is temporarily unavailable.');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      throw new Error('TIMEOUT: Request to OpenAI timed out.');
    }

    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

/**
 * Parse AI response with fallback for non-JSON responses
 * @param {string} rawResponse - Raw response from OpenAI
 * @returns {object} - Parsed response object
 */
function parseAIResponse(rawResponse) {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(rawResponse);
    return parsed;
  } catch (error) {
    // Fallback: extract JSON from markdown code blocks
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error('Failed to parse JSON from code block:', e);
      }
    }

    // Fallback: return structured response with raw text
    console.warn('Failed to parse AI response as JSON, using fallback structure');
    return {
      reply: rawResponse,
      correction: null,
      vocabulary: [],
      suggestedResponses: [],
      grammarErrors: [],
      score: null,
    };
  }
}

/**
 * Transcribe speech to text using Whisper API
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} filename - Original filename (for format detection)
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeSpeech(audioBuffer, filename = 'audio.webm') {
  try {
    // Create a File-like object from buffer
    const file = new File([audioBuffer], filename, {
      type: getAudioMimeType(filename),
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // English transcription
      response_format: 'json',
    });

    return transcription.text;
  } catch (error) {
    if (error.status === 429) {
      throw new Error('RATE_LIMIT: Whisper API rate limit exceeded.');
    } else if (error.status === 400) {
      throw new Error('INVALID_AUDIO: Audio file format not supported or corrupted.');
    }

    console.error('Whisper API error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
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

RESPONSE FORMAT (JSON):
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
  openai,
};
