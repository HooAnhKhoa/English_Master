# 🚀 QUICK START - EnglishMaster

## Khởi động nhanh (2 bước)

### 1️⃣ Chạy Backend
```bash
cd /home/khoa/EnglishMaster/backend
node server.js &
```

### 2️⃣ Chạy Frontend
```bash
cd /home/khoa/EnglishMaster/frontend
npm start
```

## 🌐 Truy cập

- **Ứng dụng:** http://localhost:3000
- **API:** http://localhost:5000/api/v1

## 👤 Đăng nhập

**Admin:**
- Email: `admin@englishmaster.com`
- Password: `admin123`

**User:**
- Email: `john@example.com`
- Password: `password123`

## 🛑 Dừng ứng dụng

```bash
# Dừng Backend
lsof -ti:5000 | xargs kill -9

# Dừng Frontend
lsof -ti:3000 | xargs kill -9
```

## 📊 Trạng thái hiện tại

✅ **Backend:** Đang chạy trên port 5000
✅ **Frontend:** Đang chạy trên port 3000
✅ **Database:** MySQL - englishmaster
✅ **Dữ liệu:**
   - 5 users
   - 17 vocabularies
   - 1 video lesson
   - 4 topics

## 📖 Xem hướng dẫn đầy đủ

```bash
cat /home/khoa/EnglishMaster/HUONG_DAN_CHAY.md
```
