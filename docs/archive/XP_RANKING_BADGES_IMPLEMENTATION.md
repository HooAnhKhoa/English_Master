# XP, Ranking, and Badges System Implementation

## Overview
Complete implementation of XP (Experience Points), Ranking/Leaderboard, and Badges system for EnglishMaster.

## Backend Implementation

### 1. Services Created

#### `services/xpService.js`
- **awardXP(userId, action, metadata, io)**: Awards XP to user with transaction support
- **calculateLevel(totalXp)**: Calculates user level based on XP
- **getXpForNextLevel(currentLevel)**: Returns XP needed for next level
- **getLevelProgress(currentXp)**: Returns progress percentage in current level
- XP Table with actions and rewards:
  - learn_new_word: 10 XP
  - review_word_correct: 5 XP
  - complete_lesson: 50 XP
  - perfect_lesson: 80 XP
  - video_segment: 15 XP
  - pronunciation_perfect: 20 XP
  - ai_conversation_turn: 8 XP
  - first_word_of_day: 15 XP (bonus)
- 20 level thresholds (Level 1-20)

#### `services/rankingService.js`
- **getPeriodKey(period, date)**: Generates period keys (daily, weekly, monthly, alltime)
- **getLeaderboard(period, page, limit)**: Fetches paginated leaderboard
- **getUserRank(userId, period)**: Gets user's rank in specific period
- **getTopUsers(period, topN)**: Gets top N users
- **initializeCronJobs()**: Sets up daily ranking reset at 00:00

#### `services/badgeService.js`
- **checkAndAward(userId, transaction)**: Checks and awards badges based on user stats
- **getUserBadges(userId)**: Gets all badges with earned status
- **getBadgeProgress(userId, badgeId)**: Gets progress for specific badge
- Supports badge types: words_learned, streak, lessons_completed, xp, video_completed, ai_turns, perfect_score

### 2. Models

#### `models/UserBadge.js`
- Junction table for User-Badge many-to-many relationship
- Fields: user_id, badge_id, awarded_at

#### Updated `models/User.js`
- Changed level from ENUM to SMALLINT (1-20)

### 3. Routes

#### `routes/xp.routes.js`
- POST `/api/v1/xp/award` - Award XP to user
- GET `/api/v1/xp/level` - Get user's level info
- GET `/api/v1/xp/table` - Get XP table

#### Updated Controllers
- `controllers/ranking.controller.js` - Integrated rankingService
- `controllers/badge.controller.js` - Integrated badgeService

### 4. Socket.IO Integration
- Server emits `xp-update` event when XP is awarded
- Server emits `ranking-update` event when rankings change
- Events include: xpGained, totalXp, levelUp, newLevel, newBadges

### 5. Cron Jobs
- Daily ranking reset at 00:00 using node-cron
- Initialized in server.js

## Frontend Implementation

### 1. Components

#### `components/Leaderboard.jsx`
- 4 period tabs: Hôm nay (Daily), Tuần này (Weekly), Tháng này (Monthly), Tổng (All-time)
- Top 3 podium layout with crown/medal icons
- Ranking list with avatars, levels, XP bars
- User's current rank sticky at bottom if outside top 20
- Real-time updates via Socket.IO
- Confetti animation on rank improvement
- Pagination support

### 2. Socket.IO Client Integration

#### Updated `index.js`
- Socket.IO client connection on user login
- Listens for `xp-update` events
- Displays XP notification toast with animation
- Shows level up and new badge notifications
- Auto-updates user XP and level in state and localStorage

### 3. Navigation

#### Updated `NavigationMenu.jsx`
- Added "Xếp hạng" (Leaderboard) menu item with Award icon

### 4. Dependencies Installed
- `socket.io-client` - Socket.IO client library
- `canvas-confetti` - Confetti animation library
- `node-cron` - Cron job scheduler (backend)

## Database Seeds

### `scripts/seed-badges.sql`
- 27 pre-defined badges across 7 categories:
  - Words Learned (5 badges)
  - Streak (4 badges)
  - Lessons Completed (4 badges)
  - XP (4 badges)
  - Video (3 badges)
  - AI Conversation (3 badges)
  - Perfect Score (3 badges)
- Rarity levels: common, rare, epic, legendary
- XP rewards ranging from 50 to 2000

## Usage Examples

### Award XP (Backend)
```javascript
const xpService = require('./services/xpService');
const io = req.app.get('io');

// Award XP for learning a new word
await xpService.awardXP(userId, 'learn_new_word', { wordId: 123 }, io);

// Award XP for completing a lesson
await xpService.awardXP(userId, 'complete_lesson', { lessonId: 5 }, io);
```

### Integration in Existing Features
Add XP awarding to:
- Vocabulary learning endpoints
- Lesson completion endpoints
- Video progress endpoints
- AI conversation endpoints
- Exercise completion endpoints

Example:
```javascript
// In vocabulary controller after learning a word
const io = req.app.get('io');
await xpService.awardXP(userId, 'learn_new_word', { vocabId: vocab.id }, io);
```

## API Endpoints

### XP
- `POST /api/v1/xp/award` - Award XP
- `GET /api/v1/xp/level` - Get level info
- `GET /api/v1/xp/table` - Get XP table

### Rankings
- `GET /api/v1/rankings?period=daily&page=1&limit=20` - Get leaderboard
- `GET /api/v1/rankings/me?period=daily` - Get user's rank

### Badges
- `GET /api/v1/badges` - Get all badges
- `GET /api/v1/badges/user/:userId` - Get user's badges
- `POST /api/v1/badges/check` - Check and award badges

## Features

✅ Transaction-based XP awarding
✅ Automatic level calculation
✅ Multi-period rankings (daily, weekly, monthly, all-time)
✅ Real-time leaderboard updates
✅ Badge system with 7 condition types
✅ Socket.IO real-time notifications
✅ Confetti animation on rank improvement
✅ XP notification toast
✅ Cron job for daily ranking reset
✅ Responsive leaderboard UI
✅ Top 3 podium display
✅ User rank highlighting
✅ Pagination support

## Next Steps

1. Run badge seed script:
```bash
mysql -u root -p englishmaster < backend/scripts/seed-badges.sql
```

2. Integrate XP awarding into existing features:
   - Add `xpService.awardXP()` calls in vocabulary, lesson, video, and AI controllers

3. Test the system:
   - Award XP and verify Socket.IO events
   - Check leaderboard updates
   - Verify badge awarding
   - Test level progression

4. Optional enhancements:
   - Add badge showcase on profile page
   - Add XP history/activity log
   - Add weekly/monthly ranking rewards
   - Add achievement notifications
