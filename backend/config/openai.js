const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI conversation response
 * @param {Array} messages - Array of message objects [{role, content}]
 * @param {object} options - Additional options
 * @returns {Promise<string>} - AI response
 */
const generateAIResponse = async (messages, options = {}) => {
  try {
    const completion = await openai.chat.completions.create({
      model: options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages,
      max_tokens: options.maxTokens || parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
      temperature: options.temperature || parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      ...options,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Analyze grammar and provide corrections
 * @param {string} text - User input text
 * @param {string} level - User's English level
 * @returns {Promise<object>} - Grammar analysis result
 */
const analyzeGrammar = async (text, level = 'intermediate') => {
  try {
    const prompt = `You are an English teacher. Analyze the following text for grammar errors and provide corrections suitable for a ${level} level student.

Text: "${text}"

Provide your response in JSON format:
{
  "hasErrors": boolean,
  "errors": [{"original": "...", "correction": "...", "explanation": "..."}],
  "suggestions": ["..."],
  "score": 0-100
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Grammar analysis error:', error);
    throw new Error('Failed to analyze grammar');
  }
};

/**
 * Generate conversation scenario
 * @param {string} scenario - Scenario type (job_interview, ordering_food, etc.)
 * @param {string} level - User's English level
 * @returns {Promise<string>} - Initial AI message
 */
const generateScenario = async (scenario, level = 'intermediate') => {
  try {
    const scenarioPrompts = {
      job_interview: `You are a hiring manager conducting a job interview. Start the conversation by greeting the candidate and asking them to introduce themselves. Keep the language appropriate for ${level} level.`,
      ordering_food: `You are a waiter at a restaurant. Greet the customer and ask what they would like to order. Use ${level} level English.`,
      travel: `You are a hotel receptionist. Greet the guest and ask how you can help them. Use ${level} level English.`,
      shopping: `You are a shop assistant. Greet the customer and offer assistance. Use ${level} level English.`,
      daily_conversation: `Start a friendly conversation about daily activities. Use ${level} level English.`,
    };

    const prompt = scenarioPrompts[scenario] || scenarioPrompts.daily_conversation;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 150,
      temperature: 0.8,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Scenario generation error:', error);
    throw new Error('Failed to generate scenario');
  }
};

module.exports = {
  openai,
  generateAIResponse,
  analyzeGrammar,
  generateScenario,
};
