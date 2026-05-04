# Quick Start Guide - EnglishMaster Backend

## 🚀 Khởi động nhanh trong 5 phút

### Bước 1: Cài đặt dependencies
```bash
cd backend
npm install
```

### Bước 2: Khởi động MySQL và Redis
```bash
# MySQL
sudo service mysql start

# Redis (nếu có)
sudo service redis-server start
```

### Bước 3: Tạo database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE englishmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Bước 4: Chạy migration
```bash
npm run migrate
```

### Bước 5: Seed data mẫu
```bash
npm run seed
```

### Bước 6: Khởi động server
```bash
npm run dev
```

✅ Server đang chạy tại: http://localhost:5000

## 🧪 Test API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@englishmaster.com",
    "password": "admin123"
  }'
```

### Get Topics (Public)
```bash
curl http://localhost:5000/api/v1/topics
```

### Get Vocabularies (Public)
```bash
curl http://localhost:5000/api/v1/vocabularies
```

### Get Lessons (Public)
```bash
curl http://localhost:5000/api/v1/lessons
```

## 📝 Sample Accounts (sau khi seed)

### Admin Account
- Email: `admin@englishmaster.com`
- Password: `admin123`
- Role: admin

### User Account
- Email: `john@example.com`
- Password: `password123`
- Role: user

## 🔧 Troubleshooting

### Lỗi kết nối MySQL
```bash
# Kiểm tra MySQL đang chạy
sudo service mysql status

# Khởi động MySQL
sudo service mysql start

# Kiểm tra credentials trong .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
```

### Lỗi Redis
```bash
# Redis không bắt buộc cho development
# Nếu không có Redis, comment các dòng liên quan trong code
# hoặc cài đặt Redis:
sudo apt-get install redis-server
sudo service redis-server start
```

### Lỗi port đã được sử dụng
```bash
# Thay đổi PORT trong .env
PORT=5001
```

### Reset database
```bash
# Undo migration
npm run migrate:undo

# Chạy lại migration
npm run migrate

# Seed lại data
npm run seed
```

## 📚 API Documentation

Xem chi tiết tại: `backend/README.md`

Base URL: `http://localhost:5000/api/v1`

### Main Endpoints:
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `GET /topics` - Danh sách chủ đề
- `GET /vocabularies` - Danh sách từ vựng
- `GET /lessons` - Danh sách bài học
- `GET /exercises` - Danh sách bài tập
- `POST /progress` - Cập nhật tiến độ
- `GET /rankings` - Bảng xếp hạng
- `GET /badges` - Danh sách huy hiệu

## 🎯 Next Steps

1. ✅ Backend API đã hoàn thành
2. ⏳ Khởi tạo Frontend React
3. ⏳ Kết nối Frontend với Backend
4. ⏳ Testing & Deployment

## 💡 Tips

- Sử dụng Postman hoặc Thunder Client để test API
- Check logs trong terminal để debug
- Đọc `backend/README.md` để hiểu chi tiết API
- Sample data đã có sẵn sau khi seed

## 🆘 Cần trợ giúp?

- Xem `backend/README.md` cho documentation đầy đủ
- Check `.env.example` cho các biến môi trường
- Xem `scripts/seed.js` để hiểu cấu trúc data
