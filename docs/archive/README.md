# EnglishMaster Project

Ứng dụng học tiếng Anh toàn diện với AI, gamification và spaced repetition.

## 📁 Cấu trúc dự án

```
EnglishMaster/
├── backend/                 # Node.js + Express API
│   ├── config/             # Cấu hình (database, redis, cloudinary, openai)
│   ├── controllers/        # Controllers xử lý logic
│   ├── middleware/         # Middleware (auth, validation, upload, rate limit)
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── scripts/            # Migration & seeding scripts
│   ├── utils/              # Utility functions
│   ├── public/             # Static files & uploads
│   ├── .env                # Environment variables
│   ├── server.js           # Entry point
│   └── package.json
│
└── frontend/               # React.js (Chưa khởi tạo)
    └── (Sẽ được tạo sau)
```

## 🚀 Backend đã hoàn thành

### ✅ Cấu hình & Setup
- [x] package.json với đầy đủ dependencies
- [x] .env.example và .env
- [x] Database configuration (Sequelize + MySQL)
- [x] Redis configuration (Cache & Rate Limit)
- [x] Cloudinary configuration (File upload)
- [x] OpenAI configuration (AI conversation)
- [x] Passport Google OAuth configuration

### ✅ Middleware
- [x] Authentication (JWT, verifyToken, isAdmin, optionalAuth)
- [x] Error Handler (Sequelize errors, JWT errors, custom errors)
- [x] Rate Limiter (API, Auth, AI, Upload limiters)
- [x] File Upload (Multer + Cloudinary)
- [x] Validation (express-validator)

### ✅ Models (Sequelize)
- [x] User (với bcrypt hash, streak tracking)
- [x] Topic
- [x] Vocabulary
- [x] Lesson
- [x] Exercise
- [x] UserProgress (với Spaced Repetition SM-2)
- [x] AIConversation & AIMessage
- [x] VideoLesson & VideoSubtitle
- [x] Ranking
- [x] Badge
- [x] Notification
- [x] Model associations (relationships)

### ✅ Controllers
- [x] auth.controller.js (register, login, forgot/reset password)
- [x] user.controller.js (CRUD users, upload avatar, stats)
- [x] topic.controller.js (CRUD topics)
- [x] vocabulary.controller.js (CRUD vocab, upload image/audio)
- [x] lesson.controller.js (CRUD lessons, add vocabularies)
- [x] exercise.controller.js (CRUD exercises, submit answers)
- [x] progress.controller.js (track progress, spaced repetition)
- [x] ai.controller.js (AI conversations, grammar analysis)
- [x] video.controller.js (CRUD videos, subtitles)
- [x] ranking.controller.js (leaderboards)
- [x] badge.controller.js (achievements, check & award)
- [x] dictionary.controller.js (word lookup, suggestions)
- [x] notification.controller.js (notifications, real-time)

### ✅ Routes
- [x] /api/v1/auth
- [x] /api/v1/users
- [x] /api/v1/topics
- [x] /api/v1/vocabularies
- [x] /api/v1/lessons
- [x] /api/v1/exercises
- [x] /api/v1/progress
- [x] /api/v1/ai
- [x] /api/v1/videos
- [x] /api/v1/rankings
- [x] /api/v1/badges
- [x] /api/v1/dictionary
- [x] /api/v1/notifications

### ✅ Utilities
- [x] logger.js (Logging utility)
- [x] email.js (Email templates & sending)
- [x] helpers.js (Common helper functions)

### ✅ Scripts
- [x] migrate.js (Database migration)
- [x] seed.js (Sample data seeding)

### ✅ Server
- [x] Express server với middleware stack
- [x] Socket.IO integration
- [x] Error handling
- [x] CORS, Helmet, Compression
- [x] Rate limiting
- [x] Health check endpoint

### ✅ Documentation
- [x] README.md với hướng dẫn đầy đủ
- [x] API documentation structure
- [x] Environment variables documentation

## 📊 Database Schema

Đã implement đầy đủ 14 bảng theo yêu cầu:
1. users - Tài khoản người dùng
2. topics - Chủ đề từ vựng
3. vocabularies - Từ vựng
4. lessons - Bài học
5. exercises - Bài tập
6. user_progress - Tiến độ học (với Spaced Repetition)
7. ai_conversations & ai_messages - Hội thoại AI
8. video_lessons & video_subtitles - Video lessons
9. rankings - Bảng xếp hạng
10. badges & user_badges - Huy hiệu
11. notifications - Thông báo
12. dictionary & user_saved_words - Từ điển

## 🎯 Features đã implement

### Authentication & Authorization
- JWT authentication
- Google OAuth 2.0
- Password reset via email
- Role-based access control (user/admin)

### Learning Features
- Vocabulary management với topics
- Interactive lessons với exercises
- Spaced Repetition System (SM-2 algorithm)
- Progress tracking
- XP & Coins system
- Streak tracking

### AI Features
- AI conversation practice
- Grammar analysis
- Scenario-based conversations
- Real-time feedback

### Gamification
- Badge system
- Leaderboards (daily, weekly, monthly, all-time)
- XP rewards
- Streak bonuses

### Video Learning
- Video lessons với subtitles
- Interactive exercises
- Progress tracking

### Social Features
- Real-time notifications (Socket.IO)
- Rankings & leaderboards
- User profiles

### Admin Features
- Content management (CRUD)
- User management
- Analytics & statistics

## 🔧 Cách chạy Backend

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình .env
File `.env` đã được tạo với cấu hình development mặc định.
Cần cập nhật các giá trị:
- Database credentials
- OpenAI API key (nếu dùng AI features)
- Cloudinary credentials (nếu upload files)
- Email credentials (nếu gửi email)

### 3. Tạo database
```bash
mysql -u root -p
CREATE DATABASE englishmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Chạy migration
```bash
npm run migrate
```

### 5. Seed data mẫu (optional)
```bash
npm run seed
```

### 6. Khởi động server
```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

## 📝 Sample Credentials (sau khi seed)

- **Admin**: admin@englishmaster.com / admin123
- **User**: john@example.com / password123

## 🔗 API Endpoints

Base URL: `http://localhost:5000/api/v1`

Xem chi tiết trong `backend/README.md`

## 📦 Dependencies chính

- express - Web framework
- sequelize - ORM
- mysql2 - MySQL driver
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- socket.io - Real-time communication
- openai - AI integration
- ioredis - Redis client
- cloudinary - File storage
- nodemailer - Email sending
- express-validator - Input validation
- helmet - Security headers
- cors - CORS handling
- compression - Response compression

## 🎨 Frontend (Chưa khởi tạo)

Frontend sẽ được xây dựng với:
- React.js
- Tailwind CSS
- Axios
- React Router
- Context API / Redux

## 📈 Tổng số files đã tạo

**Backend: 57 files JavaScript**

Bao gồm:
- 13 Controllers
- 13 Routes
- 10 Models
- 5 Middleware
- 4 Config files
- 3 Utility files
- 2 Scripts
- 1 Server file
- + các file config khác

## ✨ Highlights

1. **Chuẩn RESTful API** với response format thống nhất
2. **Security**: JWT, bcrypt, helmet, rate limiting, input validation
3. **Scalability**: Redis caching, connection pooling, pagination
4. **Real-time**: Socket.IO cho notifications
5. **AI Integration**: OpenAI GPT-4o-mini
6. **Spaced Repetition**: SM-2 algorithm cho học từ vựng
7. **Gamification**: XP, badges, streaks, leaderboards
8. **Error Handling**: Centralized error handler
9. **Validation**: express-validator cho tất cả inputs
10. **Documentation**: Đầy đủ comments và README

## 🚀 Next Steps

1. Khởi tạo Frontend React
2. Implement UI components
3. Connect Frontend với Backend API
4. Testing & Debugging
5. Deployment

## 📞 Support

Nếu có vấn đề, tham khảo:
- Backend README: `backend/README.md`
- API Documentation: `backend/api-docs.json`
