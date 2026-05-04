# OpenAI to Gemini Migration Guide

## Migration Summary

The EnglishMaster backend has been successfully migrated from OpenAI API to Google Gemini API.

## Changes Made

### 1. Dependencies
- **Removed**: `openai` package (v4.20.1)
- **Kept**: `@google/generative-ai` package (v0.24.1) - already installed

### 2. Configuration Files

#### Created:
- `backend/config/gemini.js` - Gemini API configuration
- `backend/services/geminiService.js` - Gemini service layer (replaces openaiService.js)

#### Updated:
- `backend/config/index.js` - Changed from `openai` to `gemini` configuration
- `backend/.env` - Updated environment variables

### 3. Environment Variables

**Old (OpenAI):**
```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1500
OPENAI_TEMPERATURE=0.7
```

**New (Gemini):**
```env
GEMINI_API_KEY=AIzaSyAfOZLzcoNBLmslD2jMnBaO2tDa4PSpzqk
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MAX_TOKENS=1500
GEMINI_TEMPERATURE=0.7
```

### 4. Service Layer Changes

#### `backend/services/geminiService.js`
Implements the same interface as `openaiService.js`:
- `sendMessage()` - Send messages with conversation history
- `parseAIResponse()` - Parse AI responses (JSON or text)
- `transcribeSpeech()` - Placeholder (Gemini doesn't have native speech-to-text)
- `generateSystemPrompt()` - Generate system prompts
- `analyzeGrammar()` - Analyze text grammar
- `generateScenarioOpening()` - Generate conversation openings

#### Key Differences:
- Gemini uses a different API structure (no separate system messages)
- System prompts are prepended to the conversation context
- JSON mode uses `responseMimeType: 'application/json'`
- Error handling adapted for Gemini-specific errors

### 5. Controller Updates

#### `backend/controllers/aiController.js`
- Updated imports from `openaiService` to `geminiService`
- Modified `startConversation()` to use `generateScenarioOpening()`
- Modified `sendMessage()` to use new Gemini service methods

#### `backend/controllers/ai.controller.js`
- Updated imports to use Gemini service functions
- Adapted conversation history building for Gemini format

### 6. Documentation Updates

#### `backend/README.md`
- Updated AI Integration section: OpenAI → Google Gemini
- Updated environment variables documentation
- Updated acknowledgments section

## Important Notes

### Speech-to-Text Limitation
⚠️ **Gemini API does not include native speech-to-text capabilities.**

The `transcribeSpeech()` function in `geminiService.js` is a placeholder. For audio transcription, you need to:

**Option 1: Use Google Cloud Speech-to-Text API**
```bash
npm install @google-cloud/speech
```

**Option 2: Use a third-party service**
- Deepgram
- AssemblyAI
- Whisper API (OpenAI)

### API Key Security
The Gemini API key is currently stored in `.env`. Make sure:
- `.env` is in `.gitignore`
- Never commit API keys to version control
- Use environment variables in production

### Model Differences

| Feature | OpenAI (gpt-4o-mini) | Gemini (2.5-flash) |
|---------|---------------------|-------------------|
| Max Tokens | 16,384 | 8,192 |
| Context Window | 128K | 1M |
| JSON Mode | ✅ Native | ✅ Via responseMimeType |
| Speech-to-Text | ✅ Whisper | ❌ Not included |
| Cost | $0.150/1M input | Free tier available |

## Testing the Migration

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Update Environment Variables
Make sure your `.env` file has the Gemini API key:
```env
GEMINI_API_KEY=AIzaSyAfOZLzcoNBLmslD2jMnBaO2tDa4PSpzqk
```

### 3. Start the Server
```bash
npm run dev
```

### 4. Test AI Endpoints

**Start a conversation:**
```bash
curl -X POST http://localhost:5000/api/v1/ai/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "daily_conversation",
    "topic": "hobbies"
  }'
```

**Send a message:**
```bash
curl -X POST http://localhost:5000/api/v1/ai/conversations/:id/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how are you today?"
  }'
```

**Analyze grammar:**
```bash
curl -X POST http://localhost:5000/api/v1/ai/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I goes to school yesterday",
    "level": "intermediate"
  }'
```

## Rollback Instructions

If you need to rollback to OpenAI:

1. Restore `openai` package:
```bash
npm install openai@^4.20.1
```

2. Revert environment variables in `.env`:
```env
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
```

3. Update imports in controllers:
```javascript
// Change from:
const { ... } = require('../services/geminiService');
// Back to:
const { ... } = require('../services/openaiService');
```

4. Revert `backend/config/index.js` to use `openai` configuration

## Benefits of Gemini

✅ **Lower cost** - ~50% cheaper than GPT-4o-mini  
✅ **Larger context** - 1M tokens vs 128K  
✅ **Faster responses** - Gemini 1.5 Flash is optimized for speed  
✅ **Better multilingual support** - Improved for non-English languages  
✅ **Free tier** - 15 requests/minute free quota  

## Migration Completed

Date: 2026-05-02  
Status: ✅ Complete  
Files Changed: 8  
Dependencies Updated: 1 removed, 1 kept  

All AI conversation features are now powered by Google Gemini API.
