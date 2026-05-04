# Spaced Repetition Feature - EnglishMaster

Tính năng học từ vựng với thuật toán Spaced Repetition (SM-2) đã được implement đầy đủ.

## 📁 Files đã tạo

### Backend

1. **services/spacedRepetition.js** - Service xử lý thuật toán SM-2
   - `calculateNextReview()` - Tính toán lịch ôn tập tiếp theo
   - `getQualityFromRating()` - Chuyển đổi rating sang quality score
   - `getStatus()` - Xác định trạng thái học tập
   - `calculateXpReward()` - Tính điểm XP thưởng
   - `getDailyQuota()` - Lấy quota hàng ngày theo level

2. **controllers/vocab.controller.js** - Controller xử lý API
   - `getTodayVocab()` - Lấy danh sách từ cần ôn hôm nay
   - `reviewFlashcard()` - Ghi nhận kết quả ôn tập
   - `getVocabStats()` - Thống kê học tập

3. **routes/vocab.routes.js** - API routes
   - `GET /api/v1/vocab/today` - Lấy từ vựng hôm nay
   - `POST /api/v1/vocab/flashcard/review` - Ôn tập flashcard
   - `GET /api/v1/vocab/stats` - Thống kê

### Frontend

1. **components/FlashCard.jsx** - React component
   - FlashCard component với flip animation
   - FlashCardSession component quản lý session
   - Confetti animation khi hoàn thành
   - Progress tracking

2. **services/api.js** - API client
   - Axios instance với interceptors
   - API functions cho vocab endpoints

3. **styles/flashcard.css** - Custom CSS
   - 3D flip animations
   - Confetti effects
   - Transitions và effects

4. **tailwind.config.js** - Tailwind configuration
   - Custom colors, animations, keyframes

## 🚀 Cách sử dụng

### Backend API

#### 1. Lấy danh sách từ vựng hôm nay

```bash
GET /api/v1/vocab/today
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "toReview": [
      {
        "progressId": 1,
        "vocab": {
          "id": 1,
          "word": "hello",
          "pronunciation": "/həˈloʊ/",
          "meaning": "xin chào",
          "example": "Hello! How are you?",
          "topic": {
            "name": "Daily Life",
            "icon": "🏠"
          }
        },
        "lastStudied": "2026-05-01T10:00:00.000Z",
        "attempts": 3,
        "status": "in-progress"
      }
    ],
    "newWords": [
      {
        "id": 5,
        "word": "beautiful",
        "pronunciation": "/ˈbjuːtɪfl/",
        "meaning": "đẹp"
      }
    ],
    "todayStats": {
      "reviewed": 5,
      "newLearned": 2,
      "dueCount": 10,
      "newAvailable": 15,
      "quota": {
        "newWords": 25,
        "reviewWords": 100
      },
      "streak": 7,
      "xp": 10042
    }
  }
}
```

#### 2. Ôn tập flashcard

```bash
POST /api/v1/vocab/flashcard/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "vocabId": 1,
  "quality": "easy",  // "forgot" | "hard" | "good" | "easy" hoặc 0-5
  "responseTimeMs": 2500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review recorded successfully",
  "data": {
    "progress": {
      "status": "in-progress",
      "score": 10,
      "nextReview": "2026-05-03T15:20:05.105Z",
      "intervalDays": 1,
      "repetitions": 1
    },
    "xpEarned": 32,
    "totalXp": 10042,
    "coinsEarned": 16,
    "totalCoins": 5016,
    "levelUp": null,
    "newBadge": {
      "id": 1,
      "name": "First Step",
      "icon": "🌱"
    },
    "isNewWord": true
  }
}
```

#### 3. Thống kê học tập

```bash
GET /api/v1/vocab/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "notStarted": 200,
    "inProgress": 30,
    "completed": 15,
    "mastered": 5,
    "dueToday": 10
  }
}
```

### Frontend Component

#### Sử dụng FlashCard Component

```jsx
import FlashCardSession from './components/FlashCard';
import './styles/flashcard.css';

function App() {
  return (
    <div className="App">
      <FlashCardSession />
    </div>
  );
}
```

#### Chạy Frontend

```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## 🎯 Thuật toán SM-2 (SuperMemo 2)

### Quality Ratings

- **0**: Complete blackout (quên hoàn toàn)
- **1**: Incorrect, but correct one remembered (sai nhưng nhớ được đáp án đúng)
- **2**: Incorrect, correct seemed easy (sai nhưng đáp án đúng dễ nhớ)
- **3**: Correct, significant difficulty (đúng nhưng khó)
- **4**: Correct, after hesitation (đúng sau khi do dự)
- **5**: Perfect response (hoàn hảo)

### Mapping từ UI

- **"Quên rồi"** → quality = 1
- **"Khó"** → quality = 2
- **"OK"** → quality = 4
- **"Dễ"** → quality = 5

### Công thức tính

1. **EF (Ease Factor)**:
   ```
   EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
   EF minimum = 1.3
   ```

2. **Interval (ngày)**:
   - Nếu quality < 3: reset về 1 ngày
   - Lần 1: 1 ngày
   - Lần 2: 6 ngày
   - Lần 3+: interval * EF

3. **Next Review Date**:
   ```
   nextReview = today + interval (days)
   ```

### Daily Quota theo Level

| Level | New Words | Review Words |
|-------|-----------|--------------|
| Beginner | 5 | 20 |
| Elementary | 10 | 30 |
| Intermediate | 15 | 50 |
| Upper-Intermediate | 20 | 70 |
| Advanced | 25 | 100 |

## 🎨 UI Features

### FlashCard Component

- **3D Flip Animation**: Click để lật thẻ
- **Audio Playback**: Phát âm từ (Web Speech API hoặc audio file)
- **4 Rating Buttons**: Quên rồi / Khó / OK / Dễ
- **Progress Bar**: Hiển thị tiến độ session
- **Stats Display**: Streak, XP, coins
- **Confetti Animation**: Khi hoàn thành session
- **Notification Toast**: Hiển thị XP earned, level up, new badge

### Responsive Design

- Mobile-friendly
- Tailwind CSS
- Smooth animations
- Touch-friendly buttons

## 📊 Database Schema

### user_progress table

```sql
CREATE TABLE user_progress (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('lesson', 'vocabulary', 'topic'),
  ref_id INT UNSIGNED NOT NULL,
  status ENUM('not-started', 'in-progress', 'completed', 'mastered'),
  score TINYINT UNSIGNED,
  attempts SMALLINT UNSIGNED DEFAULT 0,
  last_studied DATETIME,
  next_review DATETIME,
  ef_factor DECIMAL(4,2) DEFAULT 2.5,
  interval_days SMALLINT UNSIGNED DEFAULT 1,
  repetitions SMALLINT UNSIGNED DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE KEY (user_id, type, ref_id),
  KEY (user_id, next_review)
);
```

## 🧪 Testing

### Test Backend API

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@englishmaster.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Get today vocab
curl http://localhost:5000/api/v1/vocab/today \
  -H "Authorization: Bearer $TOKEN"

# Review flashcard
curl -X POST http://localhost:5000/api/v1/vocab/flashcard/review \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vocabId":1,"quality":"easy","responseTimeMs":2500}'

# Get stats
curl http://localhost:5000/api/v1/vocab/stats \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ Checklist hoàn thành

- [x] Service spacedRepetition.js với SM-2 algorithm
- [x] Controller vocab.controller.js
- [x] Routes vocab.routes.js
- [x] Model associations (UserProgress ↔ Vocabulary)
- [x] API endpoint GET /vocab/today
- [x] API endpoint POST /vocab/flashcard/review
- [x] API endpoint GET /vocab/stats
- [x] React component FlashCard.jsx
- [x] 3D flip animation
- [x] Audio playback
- [x] 4 rating buttons
- [x] Progress tracking
- [x] Confetti animation
- [x] XP & Badge system integration
- [x] Tailwind CSS styling
- [x] API service với axios
- [x] Testing & verification

## 🎉 Kết quả

Tính năng Spaced Repetition đã được implement đầy đủ và hoạt động tốt:

✅ Backend API hoạt động
✅ SM-2 algorithm chính xác
✅ XP & Badge system tích hợp
✅ Frontend components sẵn sàng
✅ Animations mượt mà
✅ Responsive design

Bạn có thể bắt đầu sử dụng ngay!
