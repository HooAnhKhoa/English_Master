# Spaced Repetition Implementation - Complete

## ✅ Implementation Summary

### 1. Backend Services

#### `/backend/services/spacedRepetition.js` ✅
- **calculateNextReview(quality, efFactor, interval, repetitions)**: SM-2 algorithm implementation
  - Quality: 0-5 (SuperMemo 2 standard)
  - Returns: `{ nextInterval, nextEfFactor, nextRepetitions, nextReviewDate }`
  - EF factor minimum: 1.3
  - Interval progression: 1 day → 6 days → EF * previous interval

- **getQualityFromRating(rating)**: Convert user-friendly ratings to quality scores
  - 'forgot' → 1
  - 'hard' → 2
  - 'good' → 4
  - 'easy' → 5

- **getStatus(repetitions, quality)**: Determine learning status
  - 'not-started': New words
  - 'in-progress': Currently learning
  - 'completed': 2+ correct repetitions
  - 'mastered': 5+ repetitions with quality ≥ 4

- **calculateXpReward(quality, repetitions, isNewWord)**: XP calculation
  - Base XP: 10 (regular), 20 (new word)
  - Quality multiplier: 0-1.5x
  - Repetition bonus: up to +10 XP

- **getDailyQuota(level)**: Daily learning limits
  - Beginner: 5 new, 20 review
  - Elementary: 10 new, 30 review
  - Intermediate: 15 new, 50 review
  - Upper-intermediate: 20 new, 70 review
  - Advanced: 25 new, 100 review

### 2. Backend API Endpoints

#### `GET /api/v1/vocab/today` ✅
**Controller**: `/backend/controllers/vocab.controller.js::getTodayVocab`

**Logic**:
1. Get user's level and daily quota
2. Query `user_progress` WHERE:
   - `user_id = req.user.id`
   - `type = 'vocabulary'`
   - `next_review <= NOW()`
   - `status IN ('in-progress', 'completed')`
3. JOIN with `vocabularies` and `topics`
4. Get new words not in user_progress (limit by quota)
5. Calculate today's stats (reviewed count, new learned, streak, XP)

**Response**:
```json
{
  "success": true,
  "data": {
    "toReview": [
      {
        "progressId": 123,
        "vocab": { "id": 1, "word": "hello", "meaning": "xin chào", ... },
        "lastStudied": "2026-05-01T10:00:00Z",
        "attempts": 3,
        "status": "in-progress"
      }
    ],
    "newWords": [
      { "id": 2, "word": "world", "meaning": "thế giới", ... }
    ],
    "todayStats": {
      "reviewed": 5,
      "newLearned": 2,
      "dueCount": 10,
      "newAvailable": 3,
      "quota": { "newWords": 10, "reviewWords": 30 },
      "streak": 7,
      "xp": 1250
    }
  }
}
```

#### `POST /api/v1/vocab/flashcard/review` ✅
**Controller**: `/backend/controllers/vocab.controller.js::reviewFlashcard`

**Request Body**:
```json
{
  "vocabId": 1,
  "quality": "good",  // or 0-5
  "responseTimeMs": 3500
}
```

**Logic**:
1. Validate vocabulary exists
2. Get or create `user_progress` record
3. Calculate next review using SM-2 algorithm
4. Update progress:
   - `status`: Based on repetitions and quality
   - `score`: ±10 based on quality
   - `attempts`: Increment
   - `last_studied`: NOW()
   - `next_review`: Calculated date
   - `ef_factor`, `interval_days`, `repetitions`: From SM-2
5. Calculate XP reward (bonus for new words)
6. Update user stats:
   - `xp`: Add earned XP
   - `coins`: Add XP/2
   - `total_words_learned`: Increment if new
7. Check for level up (thresholds: 500, 1500, 3000, 5000)
8. Check and award badges (words_learned milestones)

**Response**:
```json
{
  "success": true,
  "message": "Review recorded successfully",
  "data": {
    "progress": {
      "status": "in-progress",
      "score": 70,
      "nextReview": "2026-05-08T10:00:00Z",
      "intervalDays": 6,
      "repetitions": 2
    },
    "xpEarned": 15,
    "totalXp": 1265,
    "coinsEarned": 7,
    "totalCoins": 632,
    "levelUp": {
      "leveled": true,
      "newLevel": "intermediate",
      "threshold": 1500
    },
    "newBadge": {
      "id": 5,
      "name": "Word Master",
      "icon": "🏆"
    },
    "isNewWord": false
  }
}
```

#### `GET /api/v1/vocab/stats` ✅
**Controller**: `/backend/controllers/vocab.controller.js::getVocabStats`

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "notStarted": 500,
    "inProgress": 80,
    "completed": 50,
    "mastered": 20,
    "dueToday": 15
  }
}
```

### 3. Frontend Components

#### `/frontend/src/components/FlashCard.jsx` ✅

**Components**:

1. **FlashCard** - Individual card component
   - Props: `vocab`, `onReview`, `isFlipped`, `onFlip`
   - Features:
     - 3D flip animation on click
     - Front: Word + pronunciation + audio button
     - Back: Meaning, definition, example, image, synonyms/antonyms
     - 4 review buttons: "Quên rồi" (1), "Khó" (2), "OK" (4), "Dễ" (5)
     - Tracks response time from card display to button click
     - Audio playback (URL or Web Speech API fallback)

2. **FlashCardSession** - Main session manager
   - Features:
     - Loads today's vocab on mount
     - Progress bar: current/total cards
     - Streak and XP display in header
     - "✨ Từ mới" badge for new words
     - Review result notification (XP, coins, level up, badges)
     - Session complete screen with stats
     - Confetti animation on completion
     - "Làm lại" button to restart session

**Animations** (in `/frontend/src/index.css`):
- `.perspective-1000`: 3D perspective for flip
- `.transform-style-3d`: Preserve 3D transforms
- `.backface-hidden`: Hide card back during flip
- `.rotate-y-180`: 180° Y-axis rotation
- `@keyframes confetti`: Falling confetti animation
- `@keyframes slide-in`: Notification slide-in

### 4. Frontend API Service

#### `/frontend/src/services/api.js` ✅

**Functions**:
```javascript
// Get today's vocabulary
export const getTodayVocab = async () => {
  const response = await api.get('/vocab/today');
  return response.data;
};

// Review a flashcard
export const reviewFlashcard = async (vocabId, quality, responseTimeMs) => {
  const response = await api.post('/vocab/flashcard/review', {
    vocabId,
    quality,
    responseTimeMs,
  });
  return response.data;
};

// Get vocabulary statistics
export const getVocabStats = async () => {
  const response = await api.get('/vocab/stats');
  return response.data;
};
```

**Features**:
- Axios instance with base URL
- Auto-attach JWT token from localStorage
- 401 redirect to login
- Error handling

### 5. Database Schema

#### `user_progress` table ✅
```sql
- id: INT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: INT UNSIGNED (FK to users)
- type: ENUM('lesson', 'vocabulary', 'topic')
- ref_id: INT UNSIGNED (vocabulary.id)
- status: ENUM('not-started', 'in-progress', 'completed', 'mastered')
- score: TINYINT UNSIGNED (0-100)
- attempts: SMALLINT UNSIGNED
- last_studied: DATE
- next_review: DATE (for spaced repetition)
- ef_factor: DECIMAL(4,2) DEFAULT 2.5 (ease factor)
- interval_days: SMALLINT UNSIGNED DEFAULT 1
- repetitions: SMALLINT UNSIGNED DEFAULT 0
- UNIQUE INDEX (user_id, type, ref_id)
- INDEX (user_id, next_review)
```

## 🎯 User Flow

1. **User opens flashcard page**
   - Frontend calls `getTodayVocab()`
   - Backend returns due reviews + new words (respecting quota)
   - Display progress: X/Y cards

2. **User views card**
   - Front side: English word + pronunciation
   - Click to flip → Back side: meaning, example, image
   - Timer starts when card is displayed

3. **User rates difficulty**
   - Clicks: "Quên rồi" / "Khó" / "OK" / "Dễ"
   - Frontend calls `reviewFlashcard(vocabId, rating, responseTime)`
   - Backend:
     - Calculates next review date (SM-2)
     - Updates progress
     - Awards XP and coins
     - Checks level up and badges
   - Frontend shows notification with rewards

4. **Next card or completion**
   - If more cards: Show next card
   - If done: Show completion screen with confetti
   - Display stats: reviewed, new learned, streak, XP

## 🧪 Testing Checklist

- [ ] New user can see new words (up to quota)
- [ ] Review dates are calculated correctly
- [ ] "Quên rồi" resets interval to 1 day
- [ ] "Dễ" increases interval significantly
- [ ] XP is awarded correctly
- [ ] Level up triggers at thresholds
- [ ] Badges are awarded for milestones
- [ ] Progress bar updates correctly
- [ ] Confetti shows on completion
- [ ] Audio playback works
- [ ] 3D flip animation is smooth
- [ ] Response time is tracked
- [ ] Daily quota is enforced

## 🚀 How to Use

### Backend
```bash
cd EnglishMaster/backend
npm install
npm start
```

### Frontend
```bash
cd EnglishMaster/frontend
npm install
npm start
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- Flashcard page: http://localhost:3000/flashcards (add route)

## 📝 Notes

- SM-2 algorithm is industry-standard for spaced repetition
- EF factor adjusts based on user performance
- Quota prevents overwhelming users with too many words
- XP system encourages daily practice
- Badge system provides achievement milestones
- Response time tracking can be used for future analytics

## ✅ Implementation Status: COMPLETE

All required features have been implemented:
1. ✅ SM-2 algorithm service
2. ✅ GET /api/vocab/today endpoint
3. ✅ POST /api/vocab/flashcard/review endpoint
4. ✅ FlashCard React component with Tailwind CSS
5. ✅ 3D flip animation
6. ✅ Progress tracking
7. ✅ XP and badge system integration
8. ✅ Confetti completion animation
9. ✅ Audio pronunciation
10. ✅ Daily quota system
