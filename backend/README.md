# EnglishMaster Backend API

Backend API cho ứng dụng học tiếng Anh EnglishMaster, được xây dựng với Node.js, Express.js, MySQL và Sequelize ORM.

## 🚀 Tech Stack

- **Backend Framework**: Node.js + Express.js
- **Database**: MySQL 8.0+
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **OAuth**: passport-google-oauth20
- **File Upload**: Multer + Cloudinary
- **AI Integration**: Google Gemini API (gemini-2.5-flash)
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Cache & Rate Limit**: Redis (ioredis)
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit, compression

## 📋 Prerequisites

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0
- npm >= 9.0.0

## 🔧 Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd EnglishMaster/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=englishmaster
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Create MySQL Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE englishmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run Migrations

```bash
npm run migrate
```

### 6. Seed Database (Optional)

```bash
npm run seed
```

This will create:
- Admin user: `admin@englishmaster.com` / `admin123`
- Sample users, topics, vocabularies, lessons, exercises, badges

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Production Mode

```bash
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

Most endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password
- `POST /auth/logout` - Logout user

#### Users (`/users`)

- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `POST /users/:id/avatar` - Upload user avatar
- `DELETE /users/:id` - Deactivate user (Admin)
- `GET /users/:id/stats` - Get user statistics

#### Topics (`/topics`)

- `GET /topics` - Get all topics
- `GET /topics/:id` - Get topic by ID
- `POST /topics` - Create topic (Admin)
- `PUT /topics/:id` - Update topic (Admin)
- `DELETE /topics/:id` - Delete topic (Admin)
- `GET /topics/:id/vocabularies` - Get topic vocabularies

#### Vocabularies (`/vocabularies`)

- `GET /vocabularies` - Get all vocabularies
- `GET /vocabularies/:id` - Get vocabulary by ID
- `POST /vocabularies` - Create vocabulary (Admin)
- `PUT /vocabularies/:id` - Update vocabulary (Admin)
- `DELETE /vocabularies/:id` - Delete vocabulary (Admin)
- `POST /vocabularies/:id/image` - Upload vocabulary image (Admin)
- `POST /vocabularies/:id/audio` - Upload vocabulary audio (Admin)

#### Lessons (`/lessons`)

- `GET /lessons` - Get all lessons
- `GET /lessons/:id` - Get lesson by ID
- `POST /lessons` - Create lesson (Admin)
- `PUT /lessons/:id` - Update lesson (Admin)
- `DELETE /lessons/:id` - Delete lesson (Admin)
- `POST /lessons/:id/vocabularies` - Add vocabularies to lesson (Admin)
- `DELETE /lessons/:id/vocabularies/:vocabId` - Remove vocabulary from lesson (Admin)

#### Exercises (`/exercises`)

- `GET /exercises?lesson_id=:id` - Get exercises by lesson
- `GET /exercises/:id` - Get exercise by ID
- `POST /exercises` - Create exercise (Admin)
- `PUT /exercises/:id` - Update exercise (Admin)
- `DELETE /exercises/:id` - Delete exercise (Admin)
- `POST /exercises/:id/submit` - Submit exercise answer

#### Progress (`/progress`)

- `GET /progress` - Get user progress
- `GET /progress/stats` - Get progress statistics
- `GET /progress/review` - Get items due for review
- `GET /progress/:type/:refId` - Get progress for specific item
- `POST /progress` - Update progress

#### AI Conversations (`/ai`)

- `POST /ai/conversations` - Start new conversation
- `GET /ai/conversations` - Get all conversations
- `GET /ai/conversations/:id` - Get conversation by ID
- `POST /ai/conversations/:id/messages` - Send message
- `POST /ai/conversations/:id/end` - End conversation
- `POST /ai/analyze` - Analyze text grammar

#### Video Lessons (`/videos`)

- `GET /videos` - Get all video lessons
- `GET /videos/:id` - Get video by ID
- `POST /videos` - Create video (Admin)
- `PUT /videos/:id` - Update video (Admin)
- `DELETE /videos/:id` - Delete video (Admin)
- `POST /videos/:id/subtitles` - Add subtitles (Admin)
- `PUT /videos/subtitles/:subtitleId` - Update subtitle (Admin)
- `DELETE /videos/subtitles/:subtitleId` - Delete subtitle (Admin)

#### Rankings (`/rankings`)

- `GET /rankings?period=daily|weekly|monthly|alltime` - Get rankings
- `GET /rankings/me` - Get current user rank
- `POST /rankings/update` - Update user ranking

#### Badges (`/badges`)

- `GET /badges` - Get all badges
- `GET /badges/:id` - Get badge by ID
- `GET /badges/user/:userId` - Get user badges
- `POST /badges/check` - Check and award badges
- `POST /badges` - Create badge (Admin)
- `PUT /badges/:id` - Update badge (Admin)
- `DELETE /badges/:id` - Delete badge (Admin)

#### Dictionary (`/dictionary`)

- `GET /dictionary/search/:word` - Search word
- `GET /dictionary/suggest?q=:query` - Get word suggestions
- `GET /dictionary/word-of-day` - Get word of the day
- `POST /dictionary/save` - Save word to collection
- `GET /dictionary/saved` - Get saved words
- `GET /dictionary/history` - Get search history

#### Notifications (`/notifications`)

- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `POST /notifications` - Create notification (Admin)

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 🧪 Testing

```bash
npm test
```

## 📁 Project Structure

```
backend/
├── config/              # Configuration files
│   ├── database.js      # Sequelize configuration
│   ├── redis.js         # Redis configuration
│   ├── cloudinary.js    # Cloudinary configuration
│   └── gemini.js        # Gemini configuration
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
│   ├── auth.js          # Authentication middleware
│   ├── errorHandler.js  # Error handling
│   ├── rateLimiter.js   # Rate limiting
│   ├── upload.js        # File upload
│   └── validate.js      # Validation
├── models/              # Sequelize models
│   └── index.js         # Model associations
├── routes/              # API routes
├── scripts/             # Utility scripts
│   ├── migrate.js       # Database migration
│   └── seed.js          # Database seeding
├── public/              # Static files
│   └── uploads/         # Uploaded files
├── .env.example         # Environment variables example
├── .gitignore
├── package.json
├── README.md
└── server.js            # Application entry point
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcryptjs
- Helmet for security headers
- CORS configuration
- Rate limiting with Redis
- Input validation with express-validator
- SQL injection prevention (Sequelize ORM)
- XSS protection

## 🚀 Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name englishmaster-api
pm2 save
pm2 startup
```

### Using Docker

```bash
docker build -t englishmaster-api .
docker run -p 5000:5000 englishmaster-api
```

## 📝 Environment Variables

See `.env.example` for all available environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Google Gemini for AI conversation features
- Cloudinary for media storage
- Free Dictionary API for word definitions
