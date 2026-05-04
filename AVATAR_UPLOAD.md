# 📸 Chức năng Đổi Avatar - EnglishMaster

## ✅ Đã hoàn thành

### 1. **Backend Avatar Upload**
- ✅ API endpoint: `POST /api/v1/user/avatar`
- ✅ Hỗ trợ cả Cloudinary và Local Storage
- ✅ Tự động chuyển sang Local Storage nếu Cloudinary chưa cấu hình
- ✅ Xóa avatar cũ khi upload avatar mới
- ✅ Validation: chỉ chấp nhận file ảnh, tối đa 5MB
- ✅ Static file serving: `/uploads/avatars/`

### 2. **Frontend Avatar Upload**
- ✅ Component: `EditProfileModal.jsx`
- ✅ Preview ảnh trước khi upload
- ✅ Upload progress indicator
- ✅ Validation phía client
- ✅ Mobile-responsive

### 3. **Cấu hình Server**
- ✅ Multer middleware cho file upload
- ✅ Express static serving cho `/uploads`
- ✅ CORS configured cho file access

## 🎯 Cách sử dụng

### Từ giao diện web:

1. **Đăng nhập** vào ứng dụng
2. **Vào trang Profile** (click vào icon User hoặc Profile trong menu)
3. **Click nút "Edit Profile"** hoặc "Chỉnh sửa"
4. **Click vào icon camera** trên avatar
5. **Chọn ảnh** từ máy tính/điện thoại
6. **Preview** ảnh sẽ hiển thị ngay lập tức
7. **Click "Lưu thay đổi"** để upload

### Quy trình upload:

```
User chọn ảnh
    ↓
Preview hiển thị (client-side)
    ↓
User click "Lưu thay đổi"
    ↓
Upload ảnh lên server (FormData)
    ↓
Server lưu vào /uploads/avatars/
    ↓
Cập nhật URL trong database
    ↓
Trả về avatarUrl cho client
    ↓
UI cập nhật với ảnh mới
```

## 📁 Cấu trúc File

```
backend/
├── uploads/
│   └── avatars/              # Thư mục lưu avatar
│       └── avatar-{timestamp}-{random}.jpg
├── controllers/
│   └── profile.controller.js # Upload logic
├── routes/
│   └── profile.routes.js     # Avatar route
└── server.js                 # Static file serving

frontend/
└── src/
    ├── components/
    │   └── EditProfileModal.jsx  # Upload UI
    └── services/
        └── profileService.js     # Upload API call
```

## 🔧 API Endpoint

### Upload Avatar

**Endpoint:** `POST /api/v1/user/avatar`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```
FormData {
  avatar: File (image file)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "/uploads/avatars/avatar-1234567890-abc123.jpg"
  }
}
```

## 🎨 Frontend Code Example

```javascript
// Upload avatar
const formData = new FormData();
formData.append('avatar', avatarFile);

const response = await uploadAvatar(formData);
// response.data.avatarUrl = "/uploads/avatars/avatar-xxx.jpg"
```

## 📱 Mobile Support

- ✅ Touch-friendly upload button
- ✅ Camera access trên mobile (nếu browser hỗ trợ)
- ✅ Responsive modal
- ✅ Preview tối ưu cho màn hình nhỏ

## 🔒 Security

- ✅ File type validation (chỉ ảnh)
- ✅ File size limit (5MB)
- ✅ Authentication required
- ✅ Unique filename (timestamp + random)
- ✅ Safe file path handling

## 🚀 Testing

### Test upload avatar:

1. **Login** với tài khoản:
   - Email: `admin@englishmaster.com`
   - Password: `admin123`

2. **Vào Profile page**

3. **Click Edit Profile**

4. **Upload ảnh** và kiểm tra:
   - Preview hiển thị đúng
   - Upload thành công
   - Avatar mới hiển thị trên profile
   - File được lưu trong `backend/uploads/avatars/`

### Test với cURL:

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@englishmaster.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Upload avatar
curl -X POST http://localhost:5000/api/v1/user/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

## 📊 Storage Options

### Option 1: Local Storage (Hiện tại)
- ✅ Không cần cấu hình thêm
- ✅ Miễn phí
- ✅ Nhanh
- ❌ Không scale tốt cho production
- ❌ Mất dữ liệu khi deploy lại

### Option 2: Cloudinary (Tùy chọn)
Để bật Cloudinary, cập nhật `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Code sẽ tự động chuyển sang dùng Cloudinary khi có cấu hình.

## 🎯 Trạng thái

✅ **Backend**: Running on port 5000
✅ **Frontend**: Running on port 3000
✅ **Avatar Upload**: Hoạt động với Local Storage
✅ **Static Files**: Serving từ `/uploads`
✅ **Mobile**: Responsive và touch-friendly

## 📝 Notes

- Avatar được lưu với tên unique: `avatar-{timestamp}-{random}.{ext}`
- Khi upload avatar mới, avatar cũ sẽ tự động bị xóa
- Hỗ trợ các định dạng: JPG, PNG, GIF, WebP
- Tối đa 5MB mỗi file
- URL avatar: `http://localhost:5000/uploads/avatars/{filename}`

---

**Last Updated**: 2026-05-04
**Status**: ✅ Ready to use
