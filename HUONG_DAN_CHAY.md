# HƯỚNG DẪN CHẠY ỨNG DỤNG ENGLISHMASTER

**Ngày cập nhật:** 2026-05-04

## 📋 YÊU CẦU HỆ THỐNG

### Phần mềm cần cài đặt:
- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **MySQL:** >= 8.0
- **Redis:** (tùy chọn, cho caching)

### Kiểm tra phiên bản:
```bash
node --version
npm --version
mysql --version
```

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Bước 1: Cài đặt dependencies

#### Backend:
```bash
cd /home/khoa/EnglishMaster/backend
npm install
```

#### Frontend:
```bash
cd /home/khoa/EnglishMaster/frontend
npm install
```

### Bước 2: Cấu hình Database

#### Tạo database MySQL:
```bash
mysql -u root -p
```

Trong MySQL console:
```sql
CREATE DATABASE englishmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### Kiểm tra database đã tạo:
```bash
mysql -u root -pP@ssword -e "SHOW DATABASES LIKE 'englishmaster';"
```

### Bước 3: Cấu hình file .env

File `.env` đã được cấu hình sẵn tại `/home/khoa/EnglishMaster/backend/.env`

**Các thông số quan trọng:**
- **Database:** `englishmaster`
- **DB User:** `root`
- **DB Password:** `P@ssword`
- **Backend Port:** `5000`
- **Frontend Port:** `3000`
- **Gemini API Key:** Đã cấu hình
- **OpenAI API Key:** Đã cấu hình

### Bước 4: Đồng bộ Database (tạo tables)

```bash
cd /home/khoa/EnglishMaster/backend
node scripts/sync-database.js
```

Hoặc chạy migration:
```bash
npm run migrate
```

## ▶️ CHẠY ỨNG DỤNG

### Cách 1: Chạy từng service riêng biệt

#### Terminal 1 - Backend:
```bash
cd /home/khoa/EnglishMaster/backend
npm start
```

Hoặc chế độ development (auto-reload):
```bash
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd /home/khoa/EnglishMaster/frontend
npm start
```

### Cách 2: Chạy background (không cần giữ terminal)

#### Backend:
```bash
cd /home/khoa/EnglishMaster/backend
node server.js > backend.log 2>&1 &
```

#### Frontend:
```bash
cd /home/khoa/EnglishMaster/frontend
PORT=3000 npm start > frontend.log 2>&1 &
```

## 🌐 TRUY CẬP ỨNG DỤNG

Sau khi chạy thành công:

- **Frontend (Giao diện người dùng):** http://localhost:3000
- **Backend API:** http://localhost:5000/api/v1
- **Admin Panel:** http://localhost:3000/admin (cần đăng nhập với tài khoản admin)

## 👤 TÀI KHOẢN MẶC ĐỊNH

Sau khi chạy seed data (nếu có):
```bash
cd /home/khoa/EnglishMaster/backend
npm run seed
```

Tài khoản admin mặc định:
- **Email:** admin@englishmaster.com
- **Password:** admin123

Tài khoản user mẫu:
- **Email:** user@englishmaster.com
- **Password:** user123

## 🔍 KIỂM TRA TRẠNG THÁI

### Kiểm tra Backend đang chạy:
```bash
curl http://localhost:5000/api/v1/auth/login
```

Kết quả mong đợi: JSON response (có thể là lỗi validation nhưng server đang chạy)

### Kiểm tra Frontend đang chạy:
```bash
curl http://localhost:3000
```

Kết quả mong đợi: HTML content

### Kiểm tra process đang chạy:
```bash
# Backend
ps aux | grep "node server.js"

# Frontend
ps aux | grep "react-scripts start"
```

## 🛑 DỪNG ỨNG DỤNG

### Dừng process theo port:
```bash
# Dừng Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Dừng Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Dừng tất cả Node processes:
```bash
pkill -f "node server.js"
pkill -f "react-scripts start"
```

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### 1. Port đã được sử dụng

**Lỗi:** `EADDRINUSE: address already in use :::5000`

**Giải pháp:**
```bash
# Kill process trên port 5000
lsof -ti:5000 | xargs kill -9

# Hoặc port 3000
lsof -ti:3000 | xargs kill -9
```

### 2. Không kết nối được Database

**Lỗi:** `SequelizeConnectionError: Access denied`

**Giải pháp:**
- Kiểm tra MySQL đang chạy: `sudo systemctl status mysql`
- Kiểm tra thông tin đăng nhập trong `.env`
- Kiểm tra database tồn tại: `mysql -u root -p -e "SHOW DATABASES;"`

### 3. Module not found

**Lỗi:** `Cannot find module 'express'`

**Giải pháp:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### 4. Frontend không load được

**Giải pháp:**
```bash
cd /home/khoa/EnglishMaster/frontend
rm -rf node_modules package-lock.json build
npm install
npm start
```

### 5. API không hoạt động

**Kiểm tra:**
```bash
# Xem log backend
tail -f /home/khoa/EnglishMaster/backend/backend.log

# Test API endpoint
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","username":"testuser"}'
```

## 📊 CẤU TRÚC DỰ ÁN

```
EnglishMaster/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database, Redis, AI config
│   ├── controllers/        # API controllers
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, validation
│   ├── scripts/            # Database scripts
│   ├── server.js           # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── App.js         # Main app
│   │   └── index.js       # Entry point
│   ├── public/
│   └── package.json
│
└── docs/                   # Documentation
    └── PROJECT_DOCS.md
```

## 🔧 LỆNH HỮU ÍCH

### Backend:
```bash
# Chạy development mode (auto-reload)
npm run dev

# Chạy migration
npm run migrate

# Rollback migration
npm run migrate:undo

# Seed data mẫu
npm run seed

# Chạy tests
npm test
```

### Frontend:
```bash
# Chạy development
npm start

# Build production
npm run build

# Chạy tests
npm test
```

### Database:
```bash
# Truy cập MySQL
mysql -u root -pP@ssword englishmaster

# Backup database
mysqldump -u root -pP@ssword englishmaster > backup.sql

# Restore database
mysql -u root -pP@ssword englishmaster < backup.sql

# Xem tables
mysql -u root -pP@ssword englishmaster -e "SHOW TABLES;"
```

## 📝 API ENDPOINTS CHÍNH

### Authentication:
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/auth/me` - Lấy thông tin user hiện tại

### Users (Admin):
- `GET /api/v1/users` - Danh sách users
- `PUT /api/v1/users/:id` - Cập nhật user
- `DELETE /api/v1/users/:id` - Xóa user

### Vocabularies:
- `GET /api/v1/vocabularies` - Danh sách từ vựng
- `POST /api/v1/vocabularies` - Tạo từ vựng (Admin)
- `PUT /api/v1/vocabularies/:id` - Cập nhật (Admin)
- `DELETE /api/v1/vocabularies/:id` - Xóa (Admin)

### Videos:
- `GET /api/v1/videos` - Danh sách video
- `POST /api/v1/videos` - Tạo video (Admin)
- `PUT /api/v1/videos/:id` - Cập nhật (Admin)
- `DELETE /api/v1/videos/:id` - Xóa (Admin)

### AI Conversation:
- `POST /api/v1/ai/chat` - Chat với AI
- `GET /api/v1/ai/conversations` - Lịch sử chat

## 🎯 TÍNH NĂNG CHÍNH

1. **Học từ vựng:** Flashcard với thuật toán Spaced Repetition
2. **Video lessons:** Tích hợp YouTube với phụ đề
3. **AI Conversation:** Chat với AI (Gemini/OpenAI)
4. **Gamification:** XP, Level, Streak, Badges
5. **Admin Panel:** Quản lý users, videos, vocabularies, topics
6. **Responsive:** Hỗ trợ mobile, tablet, desktop

## 📱 RESPONSIVE DESIGN

- **Mobile:** < 768px (Card layout)
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px (Table layout)

## 🔐 BẢO MẬT

- JWT Authentication (7 days expiry)
- Password hashing với bcrypt
- CORS protection
- Rate limiting
- Helmet security headers

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra log files: `backend.log`, `frontend.log`
2. Kiểm tra MySQL đang chạy
3. Kiểm tra port 3000 và 5000 không bị chiếm
4. Xem file `PROJECT_DOCS.md` để biết thêm chi tiết

---

**Chúc bạn sử dụng thành công! 🎉**
