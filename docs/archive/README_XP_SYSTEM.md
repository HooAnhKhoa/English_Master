# 🎮 XP, Ranking & Badges System - Complete Guide

> **Status:** ✅ Production Ready  
> **Version:** 1.0.0  
> **Last Updated:** May 3, 2026

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [System Architecture](#system-architecture)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Frontend Usage](#frontend-usage)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

A complete gamification system for EnglishMaster featuring:

- **XP System**: 8 actions, 20 levels, transaction-based awarding
- **Ranking System**: 4 periods (daily/weekly/monthly/all-time), real-time leaderboard
- **Badge System**: 27 badges, 7 categories, automatic awarding
- **Real-time Updates**: Socket.IO notifications for XP, level-ups, and badges

### Key Features

✅ Transaction-safe XP awarding  
✅ Automatic level progression (1-20)  
✅ Multi-period leaderboards with caching  
✅ Badge auto-detection and awarding  
✅ Real-time Socket.IO notifications  
✅ Confetti animations and toast notifications  
✅ Daily ranking reset via cron job  

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Ensure dependencies are installed
cd backend && npm install
cd frontend && npm install
```

### 2. Database Setup

```bash
# Seed badges into database
mysql -u root -p englishmaster < backend/scripts/seed-badges.sql
```

### 3. Start Services

```bash
# Terminal 1: Backend
cd backend
npm start
# ✅ Server running on port 5000
# ✅ Ranking cron jobs initialized

# Terminal 2: Frontend
cd frontend
npm start
# ✅ Frontend running on port 3000
```

### 4. Verify Installation

```bash
# Test XP endpoint
curl http://localhost:5000/api/v1/xp/table

# Expected output:
# {
#   "success": true,
#   "data": {
#     "learn_new_word": 10,
#     "review_word_correct": 5,
#     ...
#   }
# }
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Leaderboard  │  │ XP Toast     │  │ Navigation   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         └──────────────────┴──────────────────┘          │
│                    Socket.IO Client                      │
└────────────────────────────┬────────────────────────────┘
                             │ WebSocket
┌────────────────────────────┼────────────────────────────┐
│                    Socket.IO Server                      │
│         ┌──────────────────┴──────────────────┐         │
│    ┌────▼─────┐  ┌──────────┐  ┌──────────┐  │         │
│    │ XP       │  │ Ranking  │  │ Badge    │  │         │
│    │ Service  │  │ Service  │  │ Service  │  │         │
│    └────┬─────┘  └────┬─────┘  └────┬─────┘  │         │
│         └─────────────┴──────────────┘        │         │
│              Sequelize Transactions           │         │
└────────────────────────┬──────────────────────┘         │
                         │                                 │
                ┌────────▼────────┐                        │
                │  MySQL Database │                        │
                └─────────────────┘                        │
```

### Data Flow: XP Award

```
User Action → Controller → xpService.awardXP()
                              ↓
                        [Transaction Start]
                              ↓
                        Update user.xp
                              ↓
                    Update rankings (4 periods)
                              ↓
                        Check level up
                              ↓
                    badgeService.checkAndAward()
                              ↓
                        [Transaction Commit]
                              ↓
                    Emit Socket.IO events
                              ↓
                    Frontend receives & updates UI
```

---

## 📡 API Reference

### XP Endpoints

#### Award XP
```http
POST /api/v1/xp/award
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "learn_new_word",
  "metadata": { "vocabId": 123 }
}

Response:
{
  "success": true,
  "data": {
    "xpGained": 10,
    "totalXp": 110,
    "levelUp": false,
    "newLevel": 2,
    "newBadges": []
  }
}
```

#### Get Level Info
```http
GET /api/v1/xp/level
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "currentXp": 110,
    "currentLevel": 2,
    "nextLevelXp": 250,
    "progress": 10
  }
}
```

#### Get XP Table
```http
GET /api/v1/xp/table

Response:
{
  "success": true,
  "data": {
    "learn_new_word": 10,
    "review_word_correct": 5,
    "complete_lesson": 50,
    "perfect_lesson": 80,
    "video_segment": 15,
    "pronunciation_perfect": 20,
    "ai_conversation_turn": 8,
    "first_word_of_day": 15
  }
}
```

### Ranking Endpoints

#### Get Leaderboard
```http
GET /api/v1/rankings?period=daily&page=1&limit=20

Response:
{
  "success": true,
  "period": "daily",
  "periodKey": "2026-05-03",
  "rankings": [
    {
      "rank": 1,
      "userId": 5,
      "username": "john_doe",
      "fullName": "John Doe",
      "avatar": "...",
      "level": 10,
      "totalXp": 15000,
      "periodXp": 500
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Get User Rank
```http
GET /api/v1/rankings/me?period=daily
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "rank": 15,
    "userId": 1,
    "periodXp": 250,
    "totalUsers": 100
  }
}
```

### Badge Endpoints

#### Get All Badges
```http
GET /api/v1/badges

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "First Steps",
      "nameVi": "Bước Đầu Tiên",
      "icon": "🌱",
      "conditionType": "words_learned",
      "conditionValue": 10,
      "xpReward": 50,
      "rarity": "common"
    }
  ]
}
```

#### Get User Badges
```http
GET /api/v1/badges/user/:userId

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "First Steps",
      "earned": true,
      "awardedAt": "2026-05-03T09:00:00.000Z"
    }
  ]
}
```

#### Check and Award Badges
```http
POST /api/v1/badges/check
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "New badges earned!",
  "data": {
    "newBadges": [...],
    "totalXpEarned": 150
  }
}
```

---

## 🔌 Integration Guide

### Step 1: Import XP Service

```javascript
const xpService = require('../services/xpService');
```

### Step 2: Get Socket.IO Instance

```javascript
const io = req.app.get('io');
```

### Step 3: Award XP

```javascript
await xpService.awardXP(userId, action, metadata, io);
```

### Complete Examples

#### Vocabulary Controller
```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { Vocabulary } = require('../models');
const xpService = require('../services/xpService');

const learnWord = asyncHandler(async (req, res) => {
  const { vocabId } = req.params;
  const userId = req.user.id;

  // Mark word as learned
  await UserProgress.create({
    user_id: userId,
    type: 'vocabulary',
    ref_id: vocabId,
    status: 'completed'
  });

  // Award XP
  const io = req.app.get('io');
  const xpResult = await xpService.awardXP(
    userId,
    'learn_new_word',
    { vocabId },
    io
  );

  res.json({
    success: true,
    message: 'Word learned',
    xp: xpResult
  });
});
```

#### Lesson Controller
```javascript
const completeLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { score } = req.body;
  const userId = req.user.id;

  // Save progress
  await UserProgress.create({
    user_id: userId,
    type: 'lesson',
    ref_id: lessonId,
    status: 'completed',
    score
  });

  // Award XP based on score
  const io = req.app.get('io');
  const action = score === 100 ? 'perfect_lesson' : 'complete_lesson';
  const xpResult = await xpService.awardXP(
    userId,
    action,
    { lessonId, score },
    io
  );

  res.json({
    success: true,
    message: 'Lesson completed',
    score,
    xp: xpResult
  });
});
```

#### Video Controller
```javascript
const completeSegment = asyncHandler(async (req, res) => {
  const { videoId, segmentIndex } = req.params;
  const userId = req.user.id;

  // Update video progress
  await UserVideoProgress.update(
    { current_segment: segmentIndex },
    { where: { user_id: userId, video_id: videoId } }
  );

  // Award XP
  const io = req.app.get('io');
  const xpResult = await xpService.awardXP(
    userId,
    'video_segment',
    { videoId, segmentIndex },
    io
  );

  res.json({
    success: true,
    message: 'Segment completed',
    xp: xpResult
  });
});
```

#### AI Conversation Controller
```javascript
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, message } = req.body;
  const userId = req.user.id;

  // Save AI message
  await AIMessage.create({
    conversation_id: conversationId,
    role: 'user',
    content: message
  });

  // Award XP
  const io = req.app.get('io');
  const xpResult = await xpService.awardXP(
    userId,
    'ai_conversation_turn',
    { conversationId },
    io
  );

  // Get AI response...
  
  res.json({
    success: true,
    message: 'Message sent',
    xp: xpResult
  });
});
```

---

## 🎨 Frontend Usage

### Navigate to Leaderboard

```javascript
// In your component
window.location.hash = 'leaderboard';

// Or using navigation function
handleNavigate('leaderboard');
```

### Listen for XP Updates

The Socket.IO integration is already set up in `index.js`. XP notifications appear automatically when XP is awarded.

### Customize XP Notification

Edit `frontend/src/index.js`:

```javascript
{xpNotification && (
  <div className="fixed top-4 right-4 z-50 animate-bounce">
    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-lg shadow-2xl">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎉</span>
        <div>
          <p className="font-bold text-lg">+{xpNotification.xpGained} XP</p>
          {xpNotification.levelUp && (
            <p className="text-sm">🎊 Level Up! Level {xpNotification.newLevel}</p>
          )}
        </div>
      </div>
    </div>
  </div>
)}
```

---

## 🧪 Testing

### Manual Testing

1. **Test XP Award**
```bash
# Login and get token
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# Award XP
curl -X POST http://localhost:5000/api/v1/xp/award \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"learn_new_word","metadata":{}}'
```

2. **Test Leaderboard**
```bash
# Get daily leaderboard
curl http://localhost:5000/api/v1/rankings?period=daily

# Get user rank
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/rankings/me?period=daily
```

3. **Test Badges**
```bash
# Check and award badges
curl -X POST http://localhost:5000/api/v1/badges/check \
  -H "Authorization: Bearer $TOKEN"
```

### Frontend Testing

1. Login to the application
2. Navigate to "Xếp hạng" (Leaderboard)
3. Perform actions that award XP
4. Verify:
   - XP notification appears
   - Leaderboard updates
   - Level up animation (if applicable)
   - Badge notification (if earned)
   - Confetti animation (if rank improves)

---

## 🐛 Troubleshooting

### Issue: XP not updating

**Symptoms:** XP awarded but no notification appears

**Solutions:**
1. Check Socket.IO connection:
```javascript
// In browser console
console.log('Socket connected:', socket.connected);
```

2. Verify backend logs for Socket.IO events:
```
✅ Socket connected: abc123
🎉 XP Update: { xpGained: 10, ... }
```

3. Check if user joined Socket.IO room:
```
User 1 joined room
```

### Issue: Leaderboard not showing data

**Symptoms:** Empty leaderboard or "No data" message

**Solutions:**
1. Check if rankings exist:
```sql
SELECT * FROM rankings WHERE period = 'daily' LIMIT 10;
```

2. Award some XP to create rankings:
```bash
curl -X POST http://localhost:5000/api/v1/xp/award ...
```

3. Check period key format:
```javascript
// Should be: "2026-05-03" for daily
console.log(rankingService.getPeriodKey('daily'));
```

### Issue: Badges not being awarded

**Symptoms:** User meets badge conditions but badge not awarded

**Solutions:**
1. Manually trigger badge check:
```bash
curl -X POST http://localhost:5000/api/v1/badges/check \
  -H "Authorization: Bearer $TOKEN"
```

2. Check user stats:
```sql
SELECT total_words_learned, streak, total_lessons_completed, xp 
FROM users WHERE id = 1;
```

3. Verify badge conditions:
```sql
SELECT * FROM badges WHERE condition_type = 'words_learned';
```

### Issue: Cron job not running

**Symptoms:** Daily rankings not resetting at 00:00

**Solutions:**
1. Check server logs on startup:
```
✅ Ranking cron jobs initialized
```

2. Verify cron schedule:
```javascript
// In rankingService.js
cron.schedule('0 0 * * *', async () => { ... });
```

3. Test cron manually:
```javascript
// In Node.js REPL
const rankingService = require('./services/rankingService');
rankingService.initializeCronJobs();
```

### Issue: Level not updating

**Symptoms:** XP increases but level stays the same

**Solutions:**
1. Check level calculation:
```javascript
const xpService = require('./services/xpService');
console.log(xpService.calculateLevel(1500)); // Should return level
```

2. Verify level thresholds:
```javascript
console.log(xpService.LEVEL_THRESHOLDS);
```

3. Check database:
```sql
SELECT id, xp, level FROM users WHERE id = 1;
```

---

## 📊 XP Actions Reference

| Action | XP | Description |
|--------|----|-----------| 
| `learn_new_word` | 10 | User learns a new vocabulary word |
| `review_word_correct` | 5 | User correctly reviews a word in flashcards |
| `complete_lesson` | 50 | User completes a lesson (any score) |
| `perfect_lesson` | 80 | User completes a lesson with 100% score |
| `video_segment` | 15 | User completes a video segment |
| `pronunciation_perfect` | 20 | User achieves perfect pronunciation score |
| `ai_conversation_turn` | 8 | User sends a message in AI conversation |
| `first_word_of_day` | 15 | User learns their first word of the day (bonus) |

---

## 🏆 Badge Reference

### Words Learned
- 🌱 First Steps (10 words) - 50 XP
- 📚 Word Explorer (50 words) - 100 XP
- 🎓 Vocabulary Master (200 words) - 200 XP
- 📖 Dictionary Pro (500 words) - 500 XP
- 🧙 Word Wizard (1000 words) - 1000 XP

### Streak
- 🔥 Consistent Learner (3 days) - 50 XP
- ⚡ Week Warrior (7 days) - 150 XP
- 🏆 Month Champion (30 days) - 500 XP
- 💎 Unstoppable (100 days) - 2000 XP

### Lessons Completed
- 📝 Lesson Starter (5 lessons) - 50 XP
- ✏️ Dedicated Student (20 lessons) - 150 XP
- 🎯 Course Master (50 lessons) - 300 XP
- 👑 Education Legend (100 lessons) - 1000 XP

### XP Milestones
- ⭐ XP Novice (500 XP) - 100 XP
- 🌟 XP Expert (2000 XP) - 200 XP
- ✨ XP Master (5000 XP) - 500 XP
- 💫 XP Legend (10000 XP) - 1500 XP

### Video
- 🎬 Video Beginner (3 videos) - 50 XP
- 📹 Video Enthusiast (10 videos) - 150 XP
- 🎥 Video Master (25 videos) - 300 XP

### AI Conversation
- 🤖 AI Curious (10 turns) - 50 XP
- 💬 AI Conversationalist (50 turns) - 150 XP
- 🗣️ AI Expert (200 turns) - 500 XP

### Perfect Score
- 💯 Perfectionist (5 perfect lessons) - 100 XP
- 🏅 Flawless Master (20 perfect lessons) - 500 XP
- 👑 Perfect Legend (50 perfect lessons) - 1500 XP

---

## 📈 Level Progression

| Level | XP Required | Total XP |
|-------|-------------|----------|
| 1 | 0 | 0 |
| 2 | 100 | 100 |
| 3 | 150 | 250 |
| 4 | 250 | 500 |
| 5 | 500 | 1,000 |
| 10 | - | 11,000 |
| 15 | - | 41,000 |
| 20 | - | 100,000 |

---

## 🎉 Success!

Your XP, Ranking, and Badges system is now fully implemented and ready to use!

**Next Steps:**
1. Seed badges: `mysql -u root -p englishmaster < backend/scripts/seed-badges.sql`
2. Start servers: `npm start` in both backend and frontend
3. Integrate XP awarding into your existing controllers
4. Test the system thoroughly
5. Monitor logs and Socket.IO events

**Documentation:**
- Technical Details: `XP_RANKING_BADGES_IMPLEMENTATION.md`
- Quick Start: `XP_QUICK_START.md`
- Summary: `IMPLEMENTATION_SUMMARY_XP_SYSTEM.md`

**Support:**
- Check server logs for errors
- Use browser console to debug Socket.IO
- Verify database records
- Test API endpoints with curl

---

**Version:** 1.0.0  
**Last Updated:** May 3, 2026  
**Status:** ✅ Production Ready
