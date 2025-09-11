# Hướng dẫn cấu hình Email cho Campus Connect

## 1. Cấu hình Gmail App Password

### Bước 1: Bật 2-Factor Authentication

1. Đăng nhập vào tài khoản Gmail của bạn
2. Vào **Settings** > **Security**
3. Bật **2-Step Verification** nếu chưa bật

### Bước 2: Tạo App Password

1. Vào **Settings** > **Security** > **2-Step Verification**
2. Cuộn xuống tìm **App passwords**
3. Chọn **Mail** và **Other (Custom name)**
4. Nhập tên: "Campus Connect"
5. Copy mật khẩu được tạo (16 ký tự)

## 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục gốc của project:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Server Configuration
PORT=5000
```

**Lưu ý quan trọng:**

- Thay `your-email@gmail.com` bằng email Gmail thực của bạn
- Thay `your-16-character-app-password` bằng App Password đã tạo ở bước trên
- **KHÔNG** sử dụng mật khẩu Gmail thông thường

## 3. Cài đặt Dependencies

Các package cần thiết đã được cài đặt:

- `nodemailer`: Gửi email
- `dotenv`: Quản lý environment variables

## 4. Kiểm tra hoạt động

1. Khởi động server:

   ```bash
   npm run dev
   ```

2. Đăng ký một sự kiện từ frontend
3. Kiểm tra email xác nhận trong hộp thư

## 5. Template Email

Email xác nhận sử dụng template HTML trong `server/sendmail-demo/template/success.html` với các placeholder:

- `{{name}}`: Tên người đăng ký
- `{{eventName}}`: Tên sự kiện
- `{{ticket}}`: Mã ticket
- `{{date}}`: Ngày đăng ký
- `{{supportEmail}}`: Email hỗ trợ

## 6. Troubleshooting

### Lỗi "Invalid login"

- Kiểm tra lại EMAIL_USER và EMAIL_PASS
- Đảm bảo đã bật 2-Factor Authentication
- Sử dụng App Password, không phải mật khẩu Gmail

### Lỗi "Less secure app access"

- Gmail không còn hỗ trợ "Less secure apps"
- Bắt buộc phải sử dụng App Password

### Email không được gửi

- Kiểm tra console log của server
- Kiểm tra kết nối internet
- Kiểm tra spam folder

## 7. API Endpoint

Server cung cấp endpoint:

```
POST /api/send-registration-email
```

Body:

```json
{
  "to": "user@example.com",
  "name": "User Name",
  "eventName": "Event Name",
  "ticket": "TCK-ABC123"
}
```

Response:

```json
{
  "success": true,
  "message": "Email đã gửi thành công!"
}
```
