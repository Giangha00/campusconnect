# API Setup Guide

## Vấn đề đã sửa

1. ✅ **CSP (Content Security Policy)**: Đã cập nhật để cho phép kết nối đến `http://localhost:8080`
2. ✅ **Error Handling**: Đã cải thiện thông báo lỗi khi không kết nối được backend

## Các bước cần làm

### 1. Restart Frontend Server
Sau khi cập nhật CSP, bạn cần restart frontend server:
```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại
npm run dev
```

### 2. Đảm bảo Spring Boot Backend đang chạy
Backend Spring Boot cần chạy trên port 8080:
```bash
# Trong thư mục Spring Boot project
./mvnw spring-boot:run
# hoặc
java -jar target/campusconnect-backend.jar
```

### 3. Cấu hình CORS trên Spring Boot (nếu cần)

Nếu vẫn gặp lỗi CORS, thêm cấu hình sau vào Spring Boot:

**Option 1: Sử dụng @CrossOrigin annotation**
```java
@RestController
@CrossOrigin(origins = "http://localhost:5000")
@RequestMapping("/api")
public class EventController {
    // ...
}
```

**Option 2: Global CORS Configuration**
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

### 4. Kiểm tra API Endpoints

Đảm bảo các endpoints sau có sẵn trên Spring Boot:
- `GET /api/events`
- `GET /api/users`
- `GET /api/feedback`
- `GET /api/gallery`
- `GET /api/admins`
- `GET /api/event-registrations`
- `POST /api/admins/login`
- `POST /api/event-registrations`
- etc.

### 5. Test kết nối

Mở browser console và kiểm tra:
- Không còn lỗi CSP
- API calls thành công (status 200)
- Dữ liệu được load từ backend

## Troubleshooting

### Lỗi "Network Error"
- Kiểm tra Spring Boot backend có đang chạy không
- Kiểm tra port 8080 có bị chiếm không
- Kiểm tra firewall có chặn không

### Lỗi CORS
- Thêm CORS configuration vào Spring Boot (xem bước 3)
- Kiểm tra `Access-Control-Allow-Origin` header

### Lỗi CSP
- Đã được sửa trong `server/index.ts`
- Restart frontend server để áp dụng thay đổi

## API Base URL

Mặc định: `http://localhost:8080/api`

Để thay đổi, sửa trong `client/src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```
