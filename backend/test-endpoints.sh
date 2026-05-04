#!/bin/bash

echo "Testing AI endpoints without authentication..."
echo ""

echo "1. Test start conversation (should fail - no auth):"
curl -s -X POST http://localhost:5000/api/v1/ai/conversations \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo ""
echo "2. Test with empty body:"
curl -s -X POST http://localhost:5000/api/v1/ai/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake_token" \
  -d '{}' | jq '.'

echo ""
echo "3. Test with valid data:"
curl -s -X POST http://localhost:5000/api/v1/ai/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake_token" \
  -d '{"scenario":"daily_conversation","topic":"hobbies"}' | jq '.'

