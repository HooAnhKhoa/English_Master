require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-exp',
  'gemini-exp-1206',
  'gemini-flash-1.5',
  'models/gemini-pro',
  'models/gemini-1.5-pro',
  'models/gemini-1.5-flash',
];

async function testModel(modelName) {
  try {
    console.log(`\n🧪 Testing: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent('Say "Hello" in JSON format: {"message": "Hello"}');
    const response = await result.response;
    const text = response.text();

    console.log(`✅ SUCCESS: ${modelName}`);
    console.log(`   Response: ${text.substring(0, 100)}...`);
    return { model: modelName, success: true, response: text };
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    console.log(`   Error: ${error.message.substring(0, 100)}...`);
    return { model: modelName, success: false, error: error.message };
  }
}

async function testAllModels() {
  console.log('🚀 Testing all Gemini models...\n');
  console.log('API Key:', process.env.GEMINI_API_KEY.substring(0, 20) + '...');

  const results = [];

  for (const modelName of models) {
    const result = await testModel(modelName);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between tests
  }

  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(50));

  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Working models (${working.length}):`);
  working.forEach(r => console.log(`   - ${r.model}`));

  console.log(`\n❌ Failed models (${failed.length}):`);
  failed.forEach(r => console.log(`   - ${r.model}`));

  if (working.length > 0) {
    console.log(`\n💡 Recommended model: ${working[0].model}`);
  }
}

testAllModels().catch(console.error);
