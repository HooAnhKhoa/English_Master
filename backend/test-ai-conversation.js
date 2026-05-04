const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Test credentials (using existing user from database)
const TEST_USER = {
  email: 'john@example.com',
  password: 'password123',
};

let authToken = '';
let conversationId = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, TEST_USER);

    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return true;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function startConversation() {
  try {
    console.log('\n🚀 Starting AI conversation...');
    const response = await axios.post(
      `${API_BASE_URL}/ai/conversations`,
      {
        scenario: 'daily_conversation',
        topic: 'technology',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      conversationId = response.data.data.conversationId;
      console.log('✅ Conversation started');
      console.log('📝 First message:', response.data.data.firstMessage);
      console.log('💡 Suggested responses:', response.data.data.suggestedResponses);
      return true;
    }
  } catch (error) {
    console.error('❌ Start conversation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function sendMessage(text) {
  try {
    console.log(`\n💬 Sending message: "${text}"`);
    const response = await axios.post(
      `${API_BASE_URL}/ai/conversations/${conversationId}/messages`,
      { content: text },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      const data = response.data.data;
      console.log('✅ Message sent');
      console.log('🤖 AI Reply:', data.reply);

      if (data.correction) {
        console.log('📝 Correction:', data.correction);
      }

      if (data.vocabulary && data.vocabulary.length > 0) {
        console.log('📚 Vocabulary:');
        data.vocabulary.forEach((vocab) => {
          console.log(`  - ${vocab.word}: ${vocab.meaning}`);
        });
      }

      if (data.grammarErrors && data.grammarErrors.length > 0) {
        console.log('⚠️ Grammar errors:');
        data.grammarErrors.forEach((error) => {
          console.log(`  - ${error.error} → ${error.correction} (${error.explanation})`);
        });
      }

      if (data.turnScore !== null) {
        console.log('⭐ Turn Score:', data.turnScore);
      }

      if (data.xpEarned) {
        console.log('🎯 XP Earned:', data.xpEarned);
      }

      if (data.suggestedResponses && data.suggestedResponses.length > 0) {
        console.log('💡 Suggested responses:', data.suggestedResponses);
      }

      return true;
    }
  } catch (error) {
    console.error('❌ Send message failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function endConversation() {
  try {
    console.log('\n🏁 Ending conversation...');
    const response = await axios.post(
      `${API_BASE_URL}/ai/conversations/${conversationId}/end`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      const scorecard = response.data.data.scorecard;
      console.log('✅ Conversation ended');
      console.log('\n📊 SCORECARD:');
      console.log('  Overall Score:', scorecard.overallScore || 'N/A');
      console.log('  Total Turns:', scorecard.totalTurns);
      console.log('  Duration:', `${scorecard.durationMin}m ${scorecard.durationSec % 60}s`);
      console.log('  XP Total:', response.data.data.xpTotal);

      if (scorecard.commonErrors && scorecard.commonErrors.length > 0) {
        console.log('  Common Errors:');
        scorecard.commonErrors.forEach((error) => {
          console.log(`    - ${error.type}: ${error.count}x`);
        });
      }

      if (response.data.data.badgesEarned && response.data.data.badgesEarned.length > 0) {
        console.log('  Badges Earned:');
        response.data.data.badgesEarned.forEach((badge) => {
          console.log(`    - ${badge.name}: ${badge.description}`);
        });
      }

      return true;
    }
  } catch (error) {
    console.error('❌ End conversation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTest() {
  console.log('🧪 Testing AI Conversation Feature\n');
  console.log('='.repeat(50));

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Test failed: Could not login');
    return;
  }

  // Step 2: Start conversation
  const startSuccess = await startConversation();
  if (!startSuccess) {
    console.log('\n❌ Test failed: Could not start conversation');
    return;
  }

  // Step 3: Send messages
  const messages = [
    "Hello! I'm interested in learning about artificial intelligence.",
    "What do you think about the future of AI?",
    "Can you explain machine learning in simple terms?",
  ];

  for (const message of messages) {
    const sendSuccess = await sendMessage(message);
    if (!sendSuccess) {
      console.log('\n❌ Test failed: Could not send message');
      return;
    }
    // Wait a bit between messages
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Step 4: End conversation
  const endSuccess = await endConversation();
  if (!endSuccess) {
    console.log('\n❌ Test failed: Could not end conversation');
    return;
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests passed!');
}

// Run the test
runTest().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
