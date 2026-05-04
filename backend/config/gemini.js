const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get Gemini model instance
 * @param {string} modelName - Model name (default: gemini-flash-latest)
 * @returns {object} - Gemini model instance
 */
function getModel(modelName = null) {
  const model = modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  console.log('Using Gemini model:', model);
  return genAI.getGenerativeModel({ model });
}

module.exports = {
  genAI,
  getModel,
};
