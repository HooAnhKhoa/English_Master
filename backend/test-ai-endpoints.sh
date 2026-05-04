#!/bin/bash

# Test AI endpoints with proper authentication

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Testing AI Endpoints                                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:5000/api/v1"

# Step 1: Register a test user
echo "1️⃣  Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_'$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "Test123456",
    "full_name": "Test User"
  }')

echo "$REGISTER_RESPONSE"
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Trying to login with existing user..."

  # Try login instead
  LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@englishmaster.com",
      "password": "admin123"
    }')

  echo "$LOGIN_RESPONSE"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Could not get authentication token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test start conversation with empty body
echo "2️⃣  Testing start conversation (empty body - should pass)..."
curl -s -X POST $BASE_URL/ai/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'
echo -e "\n"

# Step 3: Test start conversation with valid data
echo "3️⃣  Testing start conversation (with data)..."
CONV_RESPONSE=$(curl -s -X POST $BASE_URL/ai/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "scenario": "daily_conversation",
    "topic": "hobbies",
    "level": "intermediate"
  }')

echo "$CONV_RESPONSE"
CONV_ID=$(echo "$CONV_RESPONSE" | grep -o '"conversation_id":[0-9]*' | cut -d':' -f2)
echo -e "\n"

# Step 4: Test send message (empty content - should fail)
echo "4️⃣  Testing send message (empty content - should fail validation)..."
curl -s -X POST $BASE_URL/ai/conversations/$CONV_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'
echo -e "\n"

# Step 5: Test send message (with content)
echo "5️⃣  Testing send message (with content)..."
curl -s -X POST $BASE_URL/ai/conversations/$CONV_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Hello! I like reading books."
  }'
echo -e "\n"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Tests Complete                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
