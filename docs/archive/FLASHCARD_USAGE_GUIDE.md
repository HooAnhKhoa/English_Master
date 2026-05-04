# 🎴 Flashcard Spaced Repetition - Usage Guide

## 📋 Overview

The Spaced Repetition flashcard system has been fully implemented using the SM-2 algorithm. This guide will help you test and use the feature.

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd /home/khoa/EnglishMaster/backend
npm start
```

Backend will run on: `http://localhost:5000`

### 2. Start the Frontend

```bash
cd /home/khoa/EnglishMaster/frontend
npm start
```

Frontend will run on: `http://localhost:3000`

### 3. Access the Application

1. Open browser: `http://localhost:3000`
2. Login with your credentials
3. You'll see the Dashboard with today's learning stats
4. Click **"🚀 Start Learning Now"** button
5. Start reviewing flashcards!

## 🎯 User Flow

### Dashboard View
- **Day Streak**: Shows consecutive days of learning
- **Total XP**: Your experience points
- **Words Learning**: Total vocabulary in progress
- **Completed**: Words you've mastered

### Today's Learning Section
- **Words to Review**: Due for review today (based on SM-2 schedule)
- **New Words Available**: New vocabulary within your quota
- **Reviewed Today**: Progress for current day

### Flashcard Session

#### 1. Card Display
- **Front Side**: 
  - English word in large text
  - Pronunciation (IPA format)
  - 🔊 Audio button (click to hear pronunciation)
  - "Click to flip" hint

- **Back Side**:
  - Vietnamese meaning
  - Part of speech badge
  - Topic badge (if applicable)
  - Definition
  - Example sentence (English + Vietnamese)
  - Synonyms and Antonyms
  - Image (if available)

#### 2. Rating Buttons (Only visible after flipping)
- **😰 Quên rồi** (Forgot) - Quality: 1
  - Resets interval to 1 day
  - Decreases ease factor
  - Minimal XP reward
  
- **😓 Khó** (Hard) - Quality: 2
  - Resets interval to 1 day
  - Slightly decreases ease factor
  - Low XP reward
  
- **😊 OK** (Good) - Quality: 4
  - Normal progression (1 day → 6 days → EF × interval)
  - Maintains ease factor
  - Standard XP reward
  
- **😎 Dễ** (Easy) - Quality: 5
  - Fastest progression
  - Increases ease factor
  - Maximum XP reward

#### 3. Progress Tracking
- Progress bar shows: X / Y cards
- Percentage completion
- "✨ Từ mới" badge for new words

#### 4. Rewards Notification
After each review, you'll see:
- **XP Earned**: Experience points gained
- **Coins Earned**: Currency for gamification
- **Level Up**: If you reached a new level
- **New Badge**: If you unlocked an achievement

#### 5. Session Complete
- 🎉 Confetti animation
- Summary statistics:
  - Words reviewed today
  - New words learned
  - Current streak
  - Total XP earned
- **Làm lại** button to restart
- **Về Dashboard** button to return

## 🧪 Testing the Feature

### Test 1: First Time User
```bash
# Expected behavior:
# - Should see new words (up to quota based on level)
# - No review words (nothing due yet)
# - Can learn 5-25 new words depending on level
```

### Test 2: Review Scheduling
```bash
# Review a word with "OK" rating:
# - First review: next_review = tomorrow (1 day)
# - Second review: next_review = 6 days later
# - Third review: next_review = ~15 days later (6 × EF)
```

### Test 3: Forgetting a Word
```bash
# Review a word with "Quên rồi":
# - Interval resets to 1 day
# - Repetitions reset to 0
# - EF factor decreases but stays >= 1.3
```

### Test 4: XP and Level System
```bash
# New word (quality=5): 30 XP
# Review word (quality=4): ~16 XP
# Level thresholds:
# - Beginner: 0 XP
# - Elementary: 500 XP
# - Intermediate: 1500 XP
# - Upper-intermediate: 3000 XP
# - Advanced: 5000 XP
```

### Test 5: Daily Quota
```bash
# Beginner: 5 new, 20 review
# Elementary: 10 new, 30 review
# Intermediate: 15 new, 50 review
# Upper-intermediate: 20 new, 70 review
# Advanced: 25 new, 100 review
```

## 🔧 API Endpoints

### GET /api/v1/vocab/today
Returns today's vocabulary list.

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/vocab/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "toReview": [
      {
        "progressId": 123,
        "vocab": {
          "id": 1,
          "word": "hello",
          "pronunciation": "/həˈloʊ/",
          "meaning": "xin chào",
          "part_of_speech": "interjection",
          "example": "Hello, how are you?",
          "example_vi": "Xin chào, bạn khỏe không?"
        },
        "lastStudied": "2026-05-01T10:00:00Z",
        "attempts": 3,
        "status": "in-progress"
      }
    ],
    "newWords": [...],
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

### POST /api/v1/vocab/flashcard/review
Submit a flashcard review.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/vocab/flashcard/review \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vocabId": 1,
    "quality": "good",
    "responseTimeMs": 3500
  }'
```

**Response:**
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
    "levelUp": null,
    "newBadge": null,
    "isNewWord": false
  }
}
```

### GET /api/v1/vocab/stats
Get vocabulary statistics.

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/vocab/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
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

## 📊 Database Schema

### user_progress Table
```sql
CREATE TABLE user_progress (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('lesson', 'vocabulary', 'topic') NOT NULL,
  ref_id INT UNSIGNED NOT NULL,
  status ENUM('not-started', 'in-progress', 'completed', 'mastered') DEFAULT 'not-started',
  score TINYINT UNSIGNED,
  attempts SMALLINT UNSIGNED DEFAULT 0,
  last_studied DATE,
  next_review DATE,
  ef_factor DECIMAL(4,2) DEFAULT 2.5,
  interval_days SMALLINT UNSIGNED DEFAULT 1,
  repetitions SMALLINT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, type, ref_id),
  KEY (user_id, next_review)
);
```

## 🎨 UI Features

### Animations
- **3D Flip**: Card flips on click with smooth 3D transform
- **Confetti**: Celebration animation on session complete
- **Slide-in**: Notification slides in from right
- **Hover Effects**: Buttons scale on hover
- **Progress Bar**: Smooth width transition

### Responsive Design
- Mobile-friendly layout
- Touch-friendly buttons
- Adaptive grid system
- Readable font sizes

### Accessibility
- Semantic HTML
- ARIA labels (can be added)
- Keyboard navigation support
- High contrast colors

## 🐛 Troubleshooting

### Issue: No words showing up
**Solution**: 
1. Check if vocabularies exist in database
2. Verify user level matches vocabulary levels
3. Check daily quota hasn't been exceeded

### Issue: Audio not playing
**Solution**:
1. Check if `audio_url` exists in vocabulary
2. Fallback to Web Speech API (built-in)
3. Ensure browser supports audio playback

### Issue: XP not updating
**Solution**:
1. Check backend logs for errors
2. Verify user model has XP field
3. Check if badge system is working

### Issue: Cards not flipping
**Solution**:
1. Verify CSS animations are loaded
2. Check browser supports 3D transforms
3. Clear browser cache

## 📈 Performance Tips

1. **Optimize Images**: Compress vocabulary images
2. **Cache API Calls**: Use React Query or SWR
3. **Lazy Load**: Load images on demand
4. **Debounce Audio**: Prevent multiple audio plays
5. **Batch Updates**: Update multiple progress records efficiently

## 🔐 Security Considerations

1. **JWT Authentication**: All endpoints require valid token
2. **User Isolation**: Users can only access their own progress
3. **Input Validation**: Quality scores validated (0-5)
4. **Rate Limiting**: Prevent API abuse
5. **SQL Injection**: Using Sequelize ORM (parameterized queries)

## 📝 Future Enhancements

- [ ] Add audio recording for pronunciation practice
- [ ] Implement streak freeze (miss a day without losing streak)
- [ ] Add vocabulary categories/tags filtering
- [ ] Create study reminders/notifications
- [ ] Add social features (compete with friends)
- [ ] Implement adaptive difficulty
- [ ] Add dark mode
- [ ] Create mobile app (React Native)
- [ ] Add offline mode (PWA)
- [ ] Implement spaced repetition analytics dashboard

## 🎓 SM-2 Algorithm Explained

### How It Works

1. **Initial State**:
   - EF (Ease Factor) = 2.5
   - Interval = 1 day
   - Repetitions = 0

2. **After Each Review**:
   - Calculate new EF: `EF' = EF + (0.1 - (5-q) × (0.08 + (5-q) × 0.02))`
   - If quality < 3: Reset to interval=1, repetitions=0
   - If quality ≥ 3:
     - First correct: interval = 1 day
     - Second correct: interval = 6 days
     - Subsequent: interval = previous_interval × EF

3. **Example Progression** (all quality=5):
   - Review 1: 1 day
   - Review 2: 6 days
   - Review 3: 16 days
   - Review 4: 43 days
   - Review 5: 112 days
   - Review 6: 291 days
   - Review 7: 757 days

### Why SM-2?

- **Proven**: Used by Anki, SuperMemo, and other successful apps
- **Adaptive**: Adjusts to individual learning patterns
- **Efficient**: Optimizes review timing for long-term retention
- **Simple**: Easy to implement and understand

## ✅ Implementation Checklist

- [x] SM-2 algorithm service
- [x] Backend API endpoints
- [x] Database schema with spaced repetition fields
- [x] Frontend FlashCard component
- [x] 3D flip animation
- [x] Audio pronunciation
- [x] Progress tracking
- [x] XP and coins system
- [x] Level up detection
- [x] Badge system integration
- [x] Daily quota enforcement
- [x] Session completion with confetti
- [x] Responsive design
- [x] Error handling
- [x] API documentation

## 🎉 Conclusion

The Spaced Repetition flashcard system is fully implemented and ready to use! Users can now:

1. ✅ Learn new vocabulary with optimal scheduling
2. ✅ Review words at scientifically-proven intervals
3. ✅ Track progress with XP, levels, and badges
4. ✅ Enjoy smooth animations and responsive design
5. ✅ Benefit from the proven SM-2 algorithm

**Happy Learning! 🚀📚**
