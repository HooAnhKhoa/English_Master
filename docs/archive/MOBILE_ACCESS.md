# 📱 Hướng dẫn mở EnglishMaster từ điện thoại qua Tailscale

## ✅ Đã cấu hình xong!

Backend và Frontend đã được config để truy cập qua Tailscale.

---

## 📱 Cách mở từ điện thoại

### Bước 1: Đảm bảo Tailscale đang chạy
- Mở app Tailscale trên điện thoại
- Kiểm tra đã kết nối vào mạng Tailscale

### Bước 2: Mở browser trên điện thoại

### Bước 3: Gõ một trong các URL sau:

**Test Page (đơn giản nhất):**
```
http://100.90.68.89:3000/test.html
```

**Debug Page (chi tiết):**
```
http://100.90.68.89:3000/debug.html
```

**React App (ứng dụng chính):**
```
http://100.90.68.89:3000
```

**Backend API (để test):**
```
http://100.90.68.89:5000/health
```

---

## 🔧 Đã cấu hình

✅ Backend CORS: Cho phép truy cập từ IP Tailscale
✅ Frontend: Lắng nghe trên 0.0.0.0 (tất cả IP)
✅ API URL: Trỏ đến http://100.90.68.89:5000

---

## 📊 Thông tin kết nối

- **Tailscale IP**: 100.90.68.89
- **Backend Port**: 5000
- **Frontend Port**: 3000

---

## 🧪 Test từ điện thoại

1. Mở browser trên điện thoại
2. Gõ: `http://100.90.68.89:3000/test.html`
3. Bạn sẽ thấy:
   - "Simple Test Page"
   - "JavaScript is working!"
   - "Backend: Server is running"

---

## ⚠️ Lưu ý

- Đảm bảo cả máy ảo và điện thoại đều kết nối Tailscale
- Nếu không kết nối được, kiểm tra:
  - Tailscale app đang chạy trên cả 2 thiết bị
  - Firewall không chặn port 3000 và 5000
  - IP Tailscale đúng (100.90.68.89)

---

## 🚀 Sẵn sàng!

Bây giờ bạn có thể mở EnglishMaster từ điện thoại qua Tailscale!

**URL chính**: http://100.90.68.89:3000/test.html
