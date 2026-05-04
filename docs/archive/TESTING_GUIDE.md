# 🧪 Testing Guide - EnglishMaster AI Features

## 📅 Test Date: May 2, 2026

---

## 🎯 Quick Test Checklist

### ✅ Pre-Testing Setup
- [x] Backend running on http://localhost:5000
- [x] Frontend running on http://localhost:3000
- [x] OpenAI API key configured
- [x] Database connected
- [x] User account created

---

## 🧪 Test Scenarios

### 1. Test AI Conversation Feature

#### Step 1: Access AI Conversation
1. Open http://localhost:3000
2. Login with your account
3. Click "🤖 Học với AI" in navigation menu
4. **Expected**: See 7 scenario cards

#### Step 2: Start Daily Conversation
1. Click "💬 Daily Conversation" card
2. Optionally enter topic: "technology"
3. **Expected**: 
   - AI sends greeting message
   - 3 suggested responses appear
   - Chat interface loads

#### Step 3: Send Text Message
1. Type: "Hello! How are you today?"
2. Press Enter or click Send
3. **Expected**:
   - Message appears in blue bubble (right side)
   - Typing indicator shows (3 dots)
   - AI responds in white bubble (left side)
   - Turn score displayed (e.g., 95/100)
   - XP earned shown (e.g., +15 XP)

#### Step 4: Test Grammar Correction
1. Type: "I am very interesting in learning English"
2. Send message
3. **Expected**:
   - Orange correction box appears
   - Shows: "interested" not "interesting"
   - Explanation provided

#### Step 5: Test Vocabulary Learning
1. Look for purple vocabulary pills in AI response
2. Click on a vocabulary word
3. **Expected**:
   - Popup modal appears
   - Shows: word, meaning, example, level
   - Click outside to close

#### Step 6: Test Suggested Responses
1. Click one of the suggested response buttons
2. **Expected**:
   - Message sent automatically
   - AI responds immediately

#### Step 7: Test Voice Recording
1. Click microphone button 🎤
2. Speak: "I love learning English with AI"
3. Click microphone again to stop
4. **Expected**:
   - Microphone turns red while recording
   - Pulse animation shows
   - Audio transcribed automatically
   - Transcribed text shown with badge
   - AI responds to transcription

#### Step 8: Test Audio Playback
1. Look for 🔊 icon on AI messages
2. Click the speaker icon
3. **Expected**:
   - AI message read aloud (Text-to-Speech)
   - Can hear the pronunciation

#### Step 9: End Conversation
1. Click "Kết thúc" button
2. **Expected**:
   - Scorecard modal appears
   - Shows:
     * Overall score (0-100)
     * Total turns
     * Duration
     * Common errors
     * XP earned (+50 bonus)
     * New badges (if any)
   - Confetti animation plays

#### Step 10: Start New Conversation
1. Click "Bắt đầu mới" in scorecard
2. **Expected**:
   - Return to scenario selection
   - Can start another conversation

---

### 2. Test All Conversation Scenarios

Test each scenario to verify different contexts:

#### 💼 Job Interview
1. Select "Job Interview" scenario
2. Topic: "software engineer"
3. **Expected**: AI acts as interviewer

#### 🍽️ Ordering Food
1. Select "Ordering Food" scenario
2. **Expected**: AI acts as waiter/server

#### ✈️ Travel
1. Select "Travel" scenario
2. Topic: "hotel check-in"
3. **Expected**: AI acts as hotel staff

#### 🛍️ Shopping
1. Select "Shopping" scenario
2. **Expected**: AI acts as sales assistant

#### 📊 Business Meeting
1. Select "Business Meeting" scenario
2. Topic: "project planning"
3. **Expected**: AI acts as colleague

#### 👋 Making Friends
1. Select "Making Friends" scenario
2. **Expected**: AI acts as friendly person

---

### 3. Test Navigation Menu

#### Desktop Navigation
1. Resize browser to desktop size (>768px)
2. **Expected**:
   - Horizontal menu bar at top
   - All 7 menu items visible
   - User stats (XP, Level) on right
   - Active page highlighted with gradient

#### Mobile Navigation
1. Resize browser to mobile size (<768px)
2. **Expected**:
   - Hamburger menu (☰) in top-right
   - Bottom navigation bar with 5 items
   - Click hamburger to see full menu
   - Active page highlighted

#### Test All Menu Items
1. Click each menu item:
   - 🏠 Trang chủ → Dashboard
   - 📚 Từ vựng → Vocabulary page
   - 🔄 Ôn tập → Flashcard page
   - 🤖 Học với AI → AI Conversation
   - 🎥 Video → Video page
   - ✅ Kiểm tra → Exercise page
   - 👤 Profile → Profile page

---

### 4. Test Error Handling

#### Test Rate Limit (if applicable)
1. Send many messages quickly (10+ in a row)
2. **Expected**: 
   - Error message if rate limit hit
   - "AI service rate limit reached. Please try again later."

#### Test Invalid Audio
1. Try to upload a non-audio file
2. **Expected**:
   - Error message
   - "Audio file format not supported"

#### Test Network Error
1. Stop backend server
2. Try to send message
3. **Expected**:
   - Error message displayed
   - User-friendly error text

---

### 5. Test XP and Gamification

#### Test XP Earning
1. Complete a conversation with 5+ turns
2. Check XP earned:
   - Base: 10 XP per turn
   - Bonus: +5 XP if score ≥ 80
   - Completion: +50 XP
3. **Expected**: Total XP matches calculation

#### Test Level Up
1. Check current XP and level
2. Complete conversations to gain XP
3. **Expected**: 
   - Level up notification when threshold reached
   - Levels: Beginner (0), Elementary (500), Intermediate (1500), Upper-inter (3000), Advanced (5000)

---

## 🔧 API Testing with curl

### Test Start Conversation
```bash
# Login first to get token
TOKEN="your_jwt_token_here"

# Start conversation
curl -X POST http://localhost:5000/api/v1/ai/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "daily_conversation",
    "topic": "technology"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "conversationId": 1,
    "firstMessage": "Hello! I'd love to chat about technology...",
    "suggestedResponses": ["...", "...", "..."]
  }
}
```

### Test Send Message
```bash
CONV_ID=1

curl -X POST http://localhost:5000/api/v1/ai/conversations/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am interesting in AI"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "reply": "That's great! AI is fascinating...",
    "correction": "Small correction: 'I am interested in AI'...",
    "vocabulary": [...],
    "suggestedResponses": [...],
    "grammarErrors": [...],
    "turnScore": 75,
    "xpEarned": 10
  }
}
```

### Test End Conversation
```bash
curl -X POST http://localhost:5000/api/v1/ai/conversations/$CONV_ID/end \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "scorecard": {
      "overallScore": 82,
      "totalTurns": 5,
      "durationSec": 180,
      "commonErrors": [...]
    },
    "xpTotal": 50,
    "badgesEarned": []
  }
}
```

---

## 🐛 Common Issues and Solutions

### Issue: Microphone not working
**Solution**:
- Check browser permissions
- Allow microphone access
- Try HTTPS (some browsers require it)
- Check if microphone is connected

### Issue: AI not responding
**Solution**:
- Check OpenAI API key is correct
- Verify backend is running
- Check browser console for errors
- Check backend logs for API errors

### Issue: "Rate limit exceeded"
**Solution**:
- Wait a few minutes
- OpenAI has usage limits
- Check usage at https://platform.openai.com/usage

### Issue: Audio transcription fails
**Solution**:
- Check audio format (webm, mp3, wav)
- Ensure file size < 10MB
- Speak clearly into microphone
- Check internet connection

### Issue: Navigation menu not showing
**Solution**:
- Check if lucide-react is installed
- Clear browser cache
- Check browser console for errors

---

## ✅ Test Results Template

### Test Session: [Date/Time]

#### AI Conversation
- [ ] Scenario selection works
- [ ] Text messages work
- [ ] Voice recording works
- [ ] Grammar correction displays
- [ ] Vocabulary popup works
- [ ] Suggested responses work
- [ ] Audio playback works
- [ ] Scorecard displays
- [ ] XP awarded correctly

#### Navigation
- [ ] Desktop menu works
- [ ] Mobile menu works
- [ ] Bottom navigation works
- [ ] All pages accessible
- [ ] Active page highlighted

#### Error Handling
- [ ] Rate limit handled
- [ ] Network errors handled
- [ ] Invalid input handled
- [ ] User-friendly messages

#### Performance
- [ ] Fast response times
- [ ] Smooth animations
- [ ] No lag or freezing
- [ ] Mobile responsive

---

## 📊 Performance Benchmarks

### Expected Response Times
- Text message → AI response: 2-5 seconds
- Voice transcription: 1-3 seconds
- Page navigation: < 1 second
- Scorecard calculation: < 1 second

### Expected Accuracy
- Grammar correction: 90%+ accuracy
- Vocabulary extraction: 85%+ accuracy
- Speech transcription: 90%+ accuracy (clear audio)
- Turn scoring: Consistent with quality

---

## 🎉 Test Completion

Once all tests pass:
- ✅ AI Conversation feature is working
- ✅ Navigation menu is functional
- ✅ Error handling is robust
- ✅ Performance is acceptable
- ✅ Ready for production use

---

**Testing Guide Version**: 1.0.0  
**Last Updated**: May 2, 2026  
**Status**: Ready for Testing
