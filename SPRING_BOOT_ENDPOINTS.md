# Spring Boot API Endpoints Required

Frontend đang gọi các endpoints sau. Hiện tại một số endpoint trả về 404 vì chưa được implement trong Spring Boot.

## ✅ Endpoints đang hoạt động:

- `GET /api/events` - ✅ Đã có (từ hình ảnh bạn gửi)

## ❌ Endpoints cần implement (đang trả về 404):

### 1. Event Registrations

- `GET /api/event-registrations` - Lấy tất cả registrations
- `GET /api/event-registrations?eventId={id}` - Lấy registrations theo event ID
- `POST /api/event-registrations` - Tạo registration mới
- `PUT /api/event-registrations/{id}` - Cập nhật registration
- `DELETE /api/event-registrations/{id}` - Xóa registration

**Request Body (POST/PUT):**

```json
{
  "userId": "string (UUID)",
  "eventId": "number",
  "ticketNumber": "string",
  "checkedIn": "boolean"
}
```

**Response:**

```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "eventId": "number",
  "ticketNumber": "string",
  "registrationDate": "timestamp",
  "checkedIn": "boolean",
  "checkedInAt": "timestamp (nullable)"
}
```

### 2. Feedback

- `GET /api/feedback` - Lấy tất cả feedback
- `GET /api/feedback/{id}` - Lấy feedback theo ID
- `POST /api/feedback` - Tạo feedback mới
- `PUT /api/feedback/{id}` - Cập nhật feedback
- `DELETE /api/feedback/{id}` - Xóa feedback

**Request Body (POST/PUT):**

```json
{
  "userId": "string (UUID, optional)",
  "eventId": "number (optional)",
  "name": "string",
  "email": "string",
  "userType": "student | faculty | visitor",
  "rating": "number (1-5)",
  "feedback": "string",
  "status": "active | hidden"
}
```

**Response:**

```json
{
  "id": "number",
  "userId": "string (UUID, nullable)",
  "eventId": "number (nullable)",
  "name": "string",
  "email": "string",
  "userType": "string",
  "rating": "number",
  "feedback": "string",
  "status": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 3. Users

- `GET /api/users` - Lấy tất cả users
- `GET /api/users/{id}` - Lấy user theo ID
- `POST /api/users` - Tạo user mới
- `PUT /api/users/{id}` - Cập nhật user
- `DELETE /api/users/{id}` - Xóa user

**Response:**

```json
{
  "id": "string (UUID)",
  "username": "string",
  "name": "string",
  "email": "string",
  "role": "student | faculty | visitor",
  "department": "string (optional)",
  "year": "string (optional)"
}
```

### 4. Gallery

- `GET /api/gallery` - Lấy tất cả gallery items
- `GET /api/gallery/{id}` - Lấy gallery item theo ID
- `POST /api/gallery` - Tạo gallery item mới
- `PUT /api/gallery/{id}` - Cập nhật gallery item
- `DELETE /api/gallery/{id}` - Xóa gallery item

**Response:**

```json
{
  "id": "number",
  "eventId": "number (nullable)",
  "imageUrl": "string",
  "altText": "string (optional)",
  "year": "string",
  "category": "academic | cultural | sports | technical",
  "eventName": "string (optional)",
  "date": "date (optional)"
}
```

### 5. Admins

- `GET /api/admins` - Lấy tất cả admins
- `POST /api/admins/login` - Login admin

**Request Body (POST /api/admins/login):**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "id": "string (UUID)",
  "username": "string",
  "name": "string",
  "email": "string",
  "role": "admin | faculty"
}
```

## Lưu ý:

1. **Frontend đã được cập nhật** để handle 404 gracefully - nếu endpoint chưa có, sẽ trả về empty array thay vì crash
2. **CORS** cần được cấu hình để cho phép requests từ `http://localhost:5000`
3. **Response format** nên match với format trên để frontend có thể parse đúng

## Cách test:

Sau khi implement, test bằng cách:

1. Mở browser console
2. Kiểm tra không còn lỗi 404
3. Dữ liệu được load từ API thay vì empty array
