# 🚨 QUAN TRỌNG: Cách mở đúng ứng dụng

## ❌ SAI - ĐỪNG LÀM NHƯ NÀY

Đừng double-click vào file HTML trong thư mục:
- ❌ `/home/khoa/EnglishMaster/frontend/build/index.html`
- ❌ `/home/khoa/EnglishMaster/frontend/public/test.html`

Khi bạn double-click file HTML, browser sẽ mở với URL dạng:
- ❌ `file:///home/khoa/EnglishMaster/frontend/build/index.html`

URL này **KHÔNG THỂ** kết nối backend vì CORS!

---

## ✅ ĐÚNG - LÀM NHƯ NÀY

### Bước 1: Mở Browser (Chrome, Firefox, Edge...)

### Bước 2: Gõ vào Address Bar (thanh địa chỉ)

```
http://localhost:3000/test.html
```

Hoặc:

```
http://localhost:3000
```

### Bước 3: Nhấn Enter

Bạn sẽ thấy trang web với backend connection!

---

## 🔍 Kiểm tra URL đúng hay sai

Nhìn vào Address Bar của browser:

✅ **ĐÚNG**:
```
http://localhost:3000/test.html
http://localhost:3000
http://127.0.0.1:3000
```

❌ **SAI**:
```
file:///home/khoa/...
file:///C:/Users/...
/home/khoa/EnglishMaster/...
```

---

## 📊 Servers đang chạy

- **Backend**: http://localhost:5000 ✅
- **Frontend**: http://localhost:3000 ✅

Cả 2 servers đều đang chạy tốt!

---

## 💡 Nếu vẫn lỗi "Failed to fetch"

1. **Kiểm tra URL**: Phải là `http://localhost:3000`
2. **Thử Incognito**: Mở cửa sổ ẩn danh
3. **Clear cache**: Ctrl+Shift+R (Windows/Linux) hoặc Cmd+Shift+R (Mac)
4. **Thử browser khác**: Chrome, Firefox, Edge
5. **Kiểm tra firewall**: Tắt tạm thời để test

---

## 🎯 Test nhanh

Mở browser và gõ:

```
http://localhost:5000/health
```

Nếu thấy JSON response:
```json
{"success":true,"message":"Server is running",...}
```

→ Backend OK! Bây giờ mở:

```
http://localhost:3000/test.html
```

---

**Hãy thử lại và cho tôi biết kết quả!** 🚀
