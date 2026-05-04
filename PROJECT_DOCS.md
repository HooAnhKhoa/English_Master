# EnglishMaster - Project Documentation

**Last Updated:** 2026-05-04

## 🚀 Quick Start

### Start Application
```bash
# Backend (port 5000)
cd backend && npm start

# Frontend (port 3000)
cd frontend && npm start
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/v1
- **Admin Panel:** Login as admin → Navigate to admin section

## 📁 Project Structure

```
EnglishMaster/
├── backend/
│   ├── config/          # Database, Redis, Gemini AI config
│   ├── controllers/     # API controllers
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── middleware/      # Auth, validation
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── admin/   # Admin panel components
│   │   │   └── ...      # User components
│   │   ├── services/    # API services
│   │   └── App.js
│   └── public/
└── docs/                # This file
```

## 🗄️ Database Schema

### Users Table
```sql
- id, username, email, password
- full_name, avatar, role (user/admin)
- level, xp, coins, streak
- is_active (BOOLEAN, default: true)
- last_login_date
- created_at, updated_at
```

### Vocabularies Table
```sql
- id, word, pronunciation, meaning
- part_of_speech, definition, example
- level (A1-C2), topic_id
- is_active (BOOLEAN, default: true)
- created_at, updated_at
```

### Video_Lessons Table
```sql
- id, title, youtube_id, video_url
- level (A1-C2), duration_sec
- is_published, is_active (BOOLEAN, default: true)
- created_at, updated_at
```

### Topics Table
```sql
- id, name, name_vi, slug, icon
- description, level
- is_active (BOOLEAN, default: true)
- word_count
- created_at, updated_at
```

## 🎨 Admin Panel - Mobile Layout

### Layout Structure (Mobile < 768px)
```
┌─────────────────────────────────────┐
│ [Icon] Name               [Edit ↑]  │
│        [Tag][Tag][Active] [Del  ↑]  │
│        Info • Info                  │
└─────────────────────────────────────┘
```

### Features
- **Row 1:** Name/Title (bold)
- **Row 2:** Colored tags (Level, Role, Active status)
- **Row 3:** Plain text info (XP, Streak, Duration, etc.)
- **Right:** Action buttons (Edit, Delete) stacked vertically
- **Click anywhere:** Opens edit drawer

### Admin Pages
1. **AdminUsers:** Avatar + Name + [Role][Level][Active] + XP/Streak
2. **AdminVideos:** Thumbnail + Title + [Level][Active] + Duration/Subs/Exercises
3. **AdminVocabulary:** Word + [Level][POS][Active] + Meaning/Pronunciation
4. **AdminTopics:** Icon + Name + [Level][Words][Active] + Name_vi

## 🔧 Key Features

### 1. AI Conversation (Gemini)
- Chat with AI for English practice
- Context-aware responses
- Located in: `backend/services/geminiService.js`

### 2. Spaced Repetition
- Flashcard system with SM-2 algorithm
- Review intervals: 1d, 3d, 7d, 14d, 30d
- Located in: `backend/services/spacedRepetitionService.js`

### 3. XP & Ranking System
- Earn XP from lessons, exercises
- Level up system
- Badges and rankings
- Daily streak tracking

### 4. Video Lessons
- YouTube integration
- Subtitles with translations
- Interactive exercises
- Progress tracking

## 🔐 Authentication

### JWT Token
- Stored in localStorage
- Header: `Authorization: Bearer <token>`
- Expires: 7 days

### Admin Access
- Role: 'admin' in users table
- Protected routes with middleware
- Admin panel at: `/admin/*`

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 768px (Card layout, no scroll)
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px (Table layout)

### Mobile Optimizations
- Single column card layout
- No table headers
- Vertical action buttons
- Simple pagination
- Touch-friendly (min 40px targets)

## 🛠️ Development

### Environment Variables (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=english_master
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Gemini AI
GEMINI_API_KEY=your_gemini_key

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Common Commands
```bash
# Install dependencies
npm install

# Run development
npm start

# Run tests
npm test

# Database sync
node backend/scripts/sync-database.js
```

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm start
```

### Backend won't start
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
npm start
```

### Database connection error
- Check MySQL is running
- Verify .env credentials
- Check database exists

## 📝 API Endpoints

### Auth
- POST `/api/v1/auth/register` - Register user
- POST `/api/v1/auth/login` - Login
- GET `/api/v1/auth/me` - Get current user

### Users (Admin)
- GET `/api/v1/users` - List all users
- PUT `/api/v1/users/:id` - Update user
- DELETE `/api/v1/users/:id` - Delete user

### Vocabularies
- GET `/api/v1/vocabularies` - List vocabularies
- POST `/api/v1/vocabularies` - Create vocabulary (Admin)
- PUT `/api/v1/vocabularies/:id` - Update vocabulary (Admin)
- DELETE `/api/v1/vocabularies/:id` - Delete vocabulary (Admin)

### Topics
- GET `/api/v1/topics` - List topics
- POST `/api/v1/topics` - Create topic (Admin)
- PUT `/api/v1/topics/:id` - Update topic (Admin)
- DELETE `/api/v1/topics/:id` - Delete topic (Admin)

### Videos
- GET `/api/v1/videos` - List videos
- POST `/api/v1/videos` - Create video (Admin)
- PUT `/api/v1/videos/:id` - Update video (Admin)
- DELETE `/api/v1/videos/:id` - Delete video (Admin)

### AI Conversation
- POST `/api/v1/ai/chat` - Send message to AI
- GET `/api/v1/ai/conversations` - Get user conversations

## 🎯 Recent Updates (2026-05-04)

### Admin Panel Mobile Optimization
- ✅ Card layout for mobile (< 768px)
- ✅ All tags on one row with colors
- ✅ Added `is_active` field to all models
- ✅ Active/Inactive tag on all admin pages
- ✅ No horizontal scroll on mobile
- ✅ Click anywhere to edit
- ✅ Vertical action buttons

### Database Changes
- Added `is_active` to `users` table (already existed)
- Added `is_active` to `video_lessons` table
- Added `is_active` to `vocabularies` table
- `topics` table already has `is_active`

## 📚 Tech Stack

### Backend
- Node.js + Express
- MySQL + Sequelize ORM
- JWT Authentication
- Gemini AI API
- Redis (caching)

### Frontend
- React 18
- Ant Design UI
- Axios
- React Router

## 🔄 Git Workflow

```bash
# Current branch
git branch

# Commit changes
git add .
git commit -m "Description"

# Push
git push origin main
```

---

**Note:** This is the single source of truth for project documentation. All other MD files are archived.
