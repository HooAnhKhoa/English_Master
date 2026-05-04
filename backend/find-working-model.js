const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTry = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-flash',
];

async function testModel(modelName) {
  try {
    console.log(`\n🧪 Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent('Say hello in JSON format: {"message": "your message"}');
    const response = await result.response;
    const text = response.text();

    console.log(`✅ ${modelName} works!`);
    console.log(`   Response: ${text.substring(0, 100)}...`);
    return modelName;
  } catch (error) {
    console.log(`❌ ${modelName} failed: ${error.message.substring(0, 100)}`);
    return null;
  }
}

async function findWorkingModel() {
  console.log('🔍 Finding working Gemini model...');
  console.log('='.repeat(50));

  for (const modelName of modelsToTry) {
    const working = await testModel(modelName);
    if (working) {
      console.log('\n' + '='.repeat(50));
      console.log(`✅ Use this model: ${working}`);
      console.log(`Update .env: GEMINI_MODEL=${working}`);
      return;
    }
  }

  console.log('\n❌ No working model found. Check your API key and quota.');
}

findWorkingModel();
