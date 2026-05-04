const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('🔍 Fetching available Gemini models...\n');

    const models = await genAI.listModels();

    console.log('Available models:');
    console.log('='.repeat(50));

    for await (const model of models) {
      console.log(`\n📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
