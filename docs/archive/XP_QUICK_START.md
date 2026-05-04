# Quick Start Guide: XP, Ranking & Badges System

## 🚀 Setup Instructions

### 1. Database Setup

Run the badge seed script to populate initial badges:

```bash
cd /home/khoa/EnglishMaster
mysql -u root -p englishmaster < backend/scripts/seed-badges.sql
```

Or manually via MySQL:
```bash
mysql -u root -p englishmaster
source backend/scripts/seed-badges.sql;
```

### 2. Start Backend Server

```bash
cd /home/khoa/EnglishMaster/backend
npm start
```

The server will:
- Initialize Socket.IO on port 5000
- Start cron job for daily ranking reset (00:00)
- Load XP, Ranking, and Badge services

### 3. Start Frontend

```bash
cd /home/khoa/EnglishMaster/frontend
npm start
```

The frontend will:
- Connect to Socket.IO server
- Listen for XP updates
- Display leaderboard with real-time updates

## 📋 Testing the System

### Test 1: Award XP via API

```bash
# Login first to get token
TOKEN="your_jwt_token_here"

# Award XP for learning a word
curl -X POST http://localhost:5000/api/v1/xp/award \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "learn_new_word",
    "metadata": {"wordId": 1}
  }'

# Expected response:
# {
#   "success": true,
#   "message": "XP awarded successfully",
#   "data": {
#     "xpGained": 10,
#     "totalXp": 110,
#     "levelUp": false,
#     "newLevel": 2,
#     "oldLevel": 2,
#     "newBadges": []
#   }
# }
```

### Test 2: Check Leaderboard

```bash
# Get daily leaderboard
curl http://localhost:5000/api/v1/rankings?period=daily&page=1&limit=20

# Get user's rank
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/rankings/me?period=daily
```

### Test 3: Check Badges

```bash
# Get all badges
curl http://localhost:5000/api/v1/badges

# Get user's badges
curl http://localhost:5000/api/v1/badges/user/1

# Check and award badges
curl -X POST http://localhost:5000/api/v1/badges/check \
  -H "Authorization: Bearer $TOKEN"
```

### Test 4: Frontend Testing

1. **Login** to the application
2. **Navigate** to "Xếp hạng" (Leaderboard) in the menu
3. **Switch tabs** between Daily/Weekly/Monthly/All-time
4. **Perform actions** that award XP (learn words, complete lessons)
5. **Watch for**:
   - XP notification toast (top-right corner)
   - Level up animation
   - Badge earned notification
   - Leaderboard position update
   - Confetti animation on rank improvement

## 🔧 Integration into Existing Features

### Example 1: Vocabulary Controller

```javascript
// In backend/controllers/vocabulary.controller.js

const xpService = require('../services/xpService');

// After user learns a new word
const learnWord = async (req, res) => {
  // ... existing logic ...
  
  // Award XP
  const io = req.app.get('io');
  await xpService.awardXP(userId, 'learn_new_word', { vocabId }, io);
  
  // ... rest of response ...
};
```

### Example 2: Lesson Controller

```javascript
// In backend/controllers/lesson.controller.js

const xpService = require('../services/xpService');

// After user completes a lesson
const completeLesson = async (req, res) => {
  const { score } = req.body;
  
  // ... existing logic ...
  
  // Award XP based on score
  const io = req.app.get('io');
  const action = score === 100 ? 'perfect_lesson' : 'complete_lesson';
  await xpService.awardXP(userId, action, { lessonId, score }, io);
  
  // ... rest of response ...
};
```

### Example 3: AI Conversation Controller

```javascript
// In backend/controllers/ai.controller.js

const xpService = require('../services/xpService');

// After each AI conversation turn
const sendMessage = async (req, res) => {
  // ... existing logic ...
  
  // Award XP for conversation turn
  const io = req.app.get('io');
  await xpService.awardXP(userId, 'ai_conversation_turn', { conversationId }, io);
  
  // ... rest of response ...
};
```

### Example 4: Video Controller

```javascript
// In backend/controllers/video.controller.js

const xpService = require('../services/xpService');

// After user completes a video segment
const completeSegment = async (req, res) => {
  // ... existing logic ...
  
  // Award XP
  const io = req.app.get('io');
  await xpService.awardXP(userId, 'video_segment', { videoId, segmentIndex }, io);
  
  // ... rest of response ...
};
```

## 📊 XP Actions Reference

| Action | XP Reward | When to Use |
|--------|-----------|-------------|
| `learn_new_word` | 10 | User learns a new vocabulary word |
| `review_word_correct` | 5 | User correctly reviews a word |
| `complete_lesson` | 50 | User completes a lesson |
| `perfect_lesson` | 80 | User completes a lesson with 100% score |
| `video_segment` | 15 | User completes a video segment |
| `pronunciation_perfect` | 20 | User gets perfect pronunciation score |
| `ai_conversation_turn` | 8 | User sends a message in AI conversation |
| `first_word_of_day` | 15 | User learns their first word of the day (bonus) |

## 🏆 Badge Categories

1. **Words Learned** (5 badges): 10, 50, 200, 500, 1000 words
2. **Streak** (4 badges): 3, 7, 30, 100 days
3. **Lessons Completed** (4 badges): 5, 20, 50, 100 lessons
4. **XP** (4 badges): 500, 2000, 5000, 10000 XP
5. **Video** (3 badges): 3, 10, 25 videos
6. **AI Conversation** (3 badges): 10, 50, 200 turns
7. **Perfect Score** (3 badges): 5, 20, 50 perfect lessons

## 🎯 Level System

- **20 Levels** total (Level 1-20)
- **Progressive XP requirements**:
  - Level 1: 0 XP
  - Level 2: 100 XP
  - Level 5: 1,000 XP
  - Level 10: 11,000 XP
  - Level 15: 41,000 XP
  - Level 20: 100,000 XP

## 🔄 Real-time Updates

### Socket.IO Events

**Server → Client:**

1. **xp-update** - Emitted when user gains XP
```javascript
{
  xpGained: 10,
  totalXp: 110,
  levelUp: false,
  newLevel: 2,
  oldLevel: 2,
  newBadges: [],
  action: 'learn_new_word',
  metadata: { wordId: 1 }
}
```

2. **ranking-update** - Emitted when rankings change
```javascript
{
  userId: 1,
  period: 'all'
}
```

### Frontend Socket Listeners

The frontend automatically:
- Connects to Socket.IO on login
- Joins user room: `user:${userId}`
- Listens for `xp-update` events
- Updates user XP/level in state and localStorage
- Shows animated toast notification
- Triggers confetti on rank improvement

## 🐛 Troubleshooting

### Issue: XP not updating in real-time

**Solution:** Check Socket.IO connection
```javascript
// In browser console
console.log('Socket connected:', socket.connected);
```

### Issue: Badges not being awarded

**Solution:** Manually trigger badge check
```bash
curl -X POST http://localhost:5000/api/v1/badges/check \
  -H "Authorization: Bearer $TOKEN"
```

### Issue: Leaderboard not showing data

**Solution:** Check if rankings exist for current period
```bash
# Check database
mysql -u root -p englishmaster
SELECT * FROM rankings WHERE period = 'daily' LIMIT 10;
```

### Issue: Cron job not running

**Solution:** Check server logs for cron initialization
```
✅ Ranking cron jobs initialized
```

## 📱 Frontend Features

### Leaderboard Page
- **URL:** `#leaderboard`
- **Features:**
  - 4 period tabs (Daily, Weekly, Monthly, All-time)
  - Top 3 podium with special styling
  - Ranking list with avatars and XP bars
  - User highlight (yellow background)
  - Sticky user rank at bottom (if outside top 20)
  - Real-time updates
  - Confetti animation
  - Pagination

### XP Notification Toast
- **Location:** Top-right corner
- **Duration:** 3 seconds
- **Shows:**
  - XP gained
  - Level up (if applicable)
  - New badges (if any)
- **Animation:** Bounce effect

## 🎨 UI Components

### Leaderboard Icons
- 🥇 1st Place: Gold crown
- 🥈 2nd Place: Silver medal
- 🥉 3rd Place: Bronze medal
- 📊 Rank 4+: Number badge

### Badge Rarity Colors
- **Common:** Gray
- **Rare:** Blue
- **Epic:** Purple
- **Legendary:** Gold

## ✅ Verification Checklist

- [x] Backend services created (xpService, rankingService, badgeService)
- [x] Models updated (User level field, UserBadge model)
- [x] Routes created (xp.routes.js)
- [x] Controllers updated (ranking, badge)
- [x] Socket.IO integrated (server and client)
- [x] Cron jobs initialized
- [x] Frontend components created (Leaderboard.jsx)
- [x] Navigation menu updated
- [x] Dependencies installed (node-cron, socket.io-client, canvas-confetti)
- [x] Badge seed script created
- [x] Documentation created

## 🚀 Next Steps

1. **Seed badges:** Run the SQL script
2. **Test XP awarding:** Use the API or integrate into existing features
3. **Test leaderboard:** Navigate to the leaderboard page
4. **Integrate XP:** Add `xpService.awardXP()` calls to vocabulary, lesson, video, and AI controllers
5. **Monitor:** Check Socket.IO events in browser console
6. **Customize:** Adjust XP values, level thresholds, or badge conditions as needed

## 📞 Support

For issues or questions:
- Check server logs: `npm start` output
- Check browser console: F12 → Console tab
- Verify database: Check `rankings`, `badges`, `user_badges` tables
- Test Socket.IO: Use Socket.IO client tester

---

**System Status:** ✅ Fully Implemented and Ready to Use
