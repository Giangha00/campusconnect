# Kế hoạch Nâng cấp Backend: Node.js/Express → Java Spring Boot

## 📋 Tổng quan Dự án Hiện tại

### Thông tin Dự án

- **Tên dự án:** CampusConnect
- **Backend hiện tại:** Node.js + Express.js + TypeScript
- **Frontend:** React + TypeScript + Vite
- **Database:** PostgreSQL (Drizzle ORM)
- **Mục đích:** Hệ thống quản lý sự kiện và kết nối trong khuôn viên trường học

---

## 🔍 Phân tích Hiện trạng Backend

### 1. Kiến trúc Hiện tại

#### **Server Structure:**

```
server/
├── index.ts          # Entry point, Express app setup
├── routes.ts         # API routes definition
├── storage.ts        # In-memory storage (MemStorage)
├── email-config.ts   # Email service (Nodemailer)
├── vite.ts          # Vite dev server integration
└── sendmail-demo/   # Email template demo
```

#### **Công nghệ đang sử dụng:**

- **Framework:** Express.js 4.21.2
- **Language:** TypeScript 5.6.3
- **ORM:** Drizzle ORM 0.39.1
- **Database:** PostgreSQL (via @neondatabase/serverless)
- **Email:** Nodemailer 7.0.6
- **Authentication:** Passport.js + express-session
- **WebSocket:** ws 8.18.0
- **Security:** Custom middleware (CSP, XSS protection)

### 2. Chức năng Hiện tại

#### **API Endpoints:**

1. `GET /api/test` - Health check endpoint
2. `POST /api/send-registration-email` - Gửi email xác nhận đăng ký sự kiện

#### **Storage Layer:**

- **MemStorage:** In-memory storage (Map-based)
- **Schema:** Users table với Drizzle ORM
- **Interface:** IStorage với các methods:
  - `getUser(id: string)`
  - `getUserByUsername(username: string)`
  - `createUser(user: InsertUser)`

#### **Security Features:**

- Content-Security-Policy (CSP) headers
- X-XSS-Protection headers
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Request logging middleware

#### **Email Service:**

- Nodemailer với Gmail SMTP
- HTML template rendering
- Registration confirmation emails

### 3. Điểm Mạnh và Hạn chế

#### **Điểm Mạnh:**

✅ TypeScript type safety
✅ Modular structure
✅ Security headers được cấu hình tốt
✅ Vite integration cho development
✅ Drizzle ORM với schema validation

#### **Hạn chế:**

❌ In-memory storage (mất dữ liệu khi restart)
❌ Chưa có database connection thực sự
❌ Authentication chưa được implement đầy đủ
❌ Thiếu API endpoints cho các chức năng chính
❌ Chưa có error handling toàn diện
❌ Chưa có validation layer
❌ Chưa có logging system chuyên nghiệp
❌ Chưa có testing framework

---

## 🎯 Mục tiêu Nâng cấp

### 1. Mục tiêu Kỹ thuật

- ✅ Chuyển đổi sang Java Spring Boot
- ✅ Tích hợp PostgreSQL với JPA/Hibernate
- ✅ Xây dựng RESTful API đầy đủ
- ✅ Implement authentication & authorization
- ✅ Error handling & validation
- ✅ Logging & monitoring
- ✅ Security best practices
- ✅ Testing framework

### 2. Mục tiêu Nghiệp vụ

- ✅ Dữ liệu persistent trong database
- ✅ API endpoints cho tất cả chức năng
- ✅ User management system
- ✅ Event management system
- ✅ Email service integration
- ✅ Admin dashboard API support

---

## 🏗️ Kiến trúc Đề xuất: Spring Boot

### 1. Project Structure

```
campusconnect-backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── campusconnect/
│       │           ├── CampusConnectApplication.java
│       │           ├── config/
│       │           │   ├── SecurityConfig.java
│       │           │   ├── WebConfig.java
│       │           │   ├── EmailConfig.java
│       │           │   └── CorsConfig.java
│       │           ├── controller/
│       │           │   ├── AuthController.java
│       │           │   ├── UserController.java
│       │           │   ├── EventController.java
│       │           │   ├── AdminController.java
│       │           │   ├── EmailController.java
│       │           │   └── GalleryController.java
│       │           ├── service/
│       │           │   ├── AuthService.java
│       │           │   ├── UserService.java
│       │           │   ├── EventService.java
│       │           │   ├── EmailService.java
│       │           │   └── AdminService.java
│       │           ├── repository/
│       │           │   ├── UserRepository.java
│       │           │   ├── EventRepository.java
│       │           │   ├── AdminRepository.java
│       │           │   └── GalleryRepository.java
│       │           ├── model/
│       │           │   ├── entity/
│       │           │   │   ├── User.java
│       │           │   │   ├── Event.java
│       │           │   │   ├── Admin.java
│       │           │   │   ├── Gallery.java
│       │           │   │   └── Feedback.java
│       │           │   ├── dto/
│       │           │   │   ├── request/
│       │           │   │   └── response/
│       │           │   └── enums/
│       │           ├── security/
│       │           │   ├── JwtTokenProvider.java
│       │           │   ├── JwtAuthenticationFilter.java
│       │           │   └── UserDetailsServiceImpl.java
│       │           ├── exception/
│       │           │   ├── GlobalExceptionHandler.java
│       │           │   ├── ResourceNotFoundException.java
│       │           │   └── BadRequestException.java
│       │           └── util/
│       │               ├── EmailTemplateUtil.java
│       │               └── ValidationUtil.java
│       ├── resources/
│       │   ├── application.yml
│       │   ├── application-dev.yml
│       │   ├── application-prod.yml
│       │   └── templates/
│       │       └── email/
│       │           └── registration-confirmation.html
│       └── test/
│           └── java/
│               └── com/
│                   └── campusconnect/
│                       └── controller/
│                           └── UserControllerTest.java
├── pom.xml
└── README.md
```

### 2. Technology Stack Mapping

| Node.js/Express   | Spring Boot Equivalent               |
| ----------------- | ------------------------------------ |
| Express.js        | Spring Boot Web                      |
| TypeScript        | Java 17+                             |
| Drizzle ORM       | Spring Data JPA + Hibernate          |
| PostgreSQL (Neon) | PostgreSQL + HikariCP                |
| Nodemailer        | Spring Mail (JavaMailSender)         |
| Passport.js       | Spring Security + JWT                |
| express-session   | Spring Session (Redis)               |
| ws (WebSocket)    | Spring WebSocket                     |
| dotenv            | Spring Boot Configuration            |
| zod (validation)  | Bean Validation (Jakarta Validation) |
| Custom middleware | Spring Interceptors/Filters          |

### 3. Dependencies Đề xuất (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Thymeleaf for Email Templates -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>

    <!-- Redis (Optional, for session management) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 📝 Chi tiết Implementation

### 1. Database Schema Migration

#### **Entity Classes:**

```java
// User Entity
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String name;
    private String email;
    private String role;
    private String department;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<EventRegistration> registrations;

    @ManyToMany
    @JoinTable(
        name = "user_bookmarked_events",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    private List<Event> bookmarkedEvents;

    // Getters, setters, constructors
}

// Event Entity
@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private String status;
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<EventRegistration> registrations;

    // Getters, setters, constructors
}

// Admin Entity
@Entity
@Table(name = "admins")
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String name;
    private String email;

    @Enumerated(EnumType.STRING)
    private AdminRole role; // ADMIN, FACULTY

    // Getters, setters, constructors
}
```

### 2. API Endpoints Design

#### **Authentication APIs:**

```
POST   /api/auth/register      - Đăng ký user mới
POST   /api/auth/login         - Đăng nhập
POST   /api/auth/logout        - Đăng xuất
POST   /api/auth/refresh      - Refresh JWT token
GET    /api/auth/me           - Lấy thông tin user hiện tại
```

#### **User APIs:**

```
GET    /api/users              - Lấy danh sách users (admin only)
GET    /api/users/{id}         - Lấy thông tin user
PUT    /api/users/{id}         - Cập nhật user
DELETE /api/users/{id}        - Xóa user (admin only)
```

#### **Event APIs:**

```
GET    /api/events             - Lấy danh sách events
GET    /api/events/{id}        - Lấy chi tiết event
POST   /api/events             - Tạo event mới (admin)
PUT    /api/events/{id}        - Cập nhật event (admin)
DELETE /api/events/{id}        - Xóa event (admin)
POST   /api/events/{id}/register    - Đăng ký event
DELETE /api/events/{id}/register   - Hủy đăng ký
POST   /api/events/{id}/bookmark    - Bookmark event
DELETE /api/events/{id}/bookmark    - Unbookmark event
```

#### **Admin APIs:**

```
GET    /api/admin/dashboard    - Dashboard statistics
GET    /api/admin/analytics    - Analytics data
GET    /api/admin/users        - Quản lý users
GET    /api/admin/events       - Quản lý events
```

#### **Email APIs:**

```
POST   /api/email/send-registration - Gửi email xác nhận đăng ký
```

### 3. Security Implementation

#### **SecurityConfig.java:**

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/events/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; " +
                        "script-src 'self' 'unsafe-inline'; " +
                        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                        "img-src 'self' data: https: http:; " +
                        "font-src 'self' https://fonts.gstatic.com; " +
                        "frame-src 'none'; " +
                        "object-src 'none';"))
                .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                .contentTypeOptions(HeadersConfigurer.ContentTypeOptionsConfig::and)
                .frameOptions(frame -> frame.deny())
            );

        return http.build();
    }
}
```

#### **JWT Token Provider:**

```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(Authentication authentication) {
        // Implementation
    }

    public String getUsernameFromToken(String token) {
        // Implementation
    }

    public boolean validateToken(String token) {
        // Implementation
    }
}
```

### 4. Email Service Implementation

#### **EmailService.java:**

```java
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendRegistrationEmail(
        String to,
        String name,
        String eventName,
        String ticket
    ) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("eventName", eventName);
        context.setVariable("ticket", ticket);
        context.setVariable("date", LocalDateTime.now());

        String htmlContent = templateEngine.process(
            "email/registration-confirmation",
            context
        );

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("Xác nhận đăng ký: " + eventName);
        helper.setText(htmlContent, true);
        helper.setFrom("noreply@campusconnect.edu");

        mailSender.send(message);
    }
}
```

### 5. Error Handling

#### **GlobalExceptionHandler.java:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
        MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            errors,
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
```

### 6. Configuration Files

#### **application.yml:**

```yaml
spring:
  application:
    name: campusconnect-backend

  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/campusconnect}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USER}
    password: ${EMAIL_PASS}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

  security:
    jwt:
      secret: ${JWT_SECRET:your-secret-key-change-in-production}
      expiration: 86400000 # 24 hours

server:
  port: ${PORT:8080}
  error:
    include-message: always
    include-binding-errors: always

logging:
  level:
    com.campusconnect: DEBUG
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

---

## 🚀 Migration Strategy

### Phase 1: Setup & Infrastructure (Week 1-2)

1. ✅ Tạo Spring Boot project structure
2. ✅ Cấu hình database connection
3. ✅ Setup Spring Security
4. ✅ Cấu hình email service
5. ✅ Setup logging & monitoring

### Phase 2: Core Entities & Repositories (Week 2-3)

1. ✅ Tạo Entity classes
2. ✅ Tạo Repository interfaces
3. ✅ Database migration scripts
4. ✅ Seed data scripts

### Phase 3: Authentication & Authorization (Week 3-4)

1. ✅ Implement JWT authentication
2. ✅ User registration & login
3. ✅ Role-based access control
4. ✅ Password encryption (BCrypt)

### Phase 4: Core APIs (Week 4-6)

1. ✅ User management APIs
2. ✅ Event management APIs
3. ✅ Registration & bookmarking APIs
4. ✅ Admin dashboard APIs

### Phase 5: Email & Additional Features (Week 6-7)

1. ✅ Email service integration
2. ✅ Template rendering
3. ✅ File upload (if needed)
4. ✅ WebSocket support (if needed)

### Phase 6: Testing & Documentation (Week 7-8)

1. ✅ Unit tests
2. ✅ Integration tests
3. ✅ API documentation (Swagger/OpenAPI)
4. ✅ Deployment guide

---

## 🔄 Data Migration Plan

### 1. Schema Migration

- Sử dụng Flyway hoặc Liquibase để quản lý database migrations
- Tạo migration scripts từ Drizzle schema hiện tại
- Đảm bảo backward compatibility trong quá trình migration

### 2. Data Migration

- Export data từ in-memory storage (nếu có)
- Import vào PostgreSQL database
- Validate data integrity

### 3. API Compatibility

- Đảm bảo API endpoints tương thích với frontend
- Có thể chạy song song trong giai đoạn transition
- Version API nếu cần thiết

---

## 📊 So sánh Performance & Scalability

### Node.js/Express (Hiện tại)

- ✅ Fast startup time
- ✅ Good for I/O-intensive operations
- ❌ Single-threaded (CPU-bound limitations)
- ❌ Memory management challenges
- ❌ Type safety depends on TypeScript

### Spring Boot (Đề xuất)

- ✅ Multi-threaded (better CPU utilization)
- ✅ Strong type safety (compile-time)
- ✅ Better memory management (JVM)
- ✅ Enterprise-grade features
- ✅ Better tooling & ecosystem
- ✅ Stronger security framework
- ❌ Longer startup time
- ❌ Higher memory footprint

---

## 🛡️ Security Enhancements

### Improvements với Spring Boot:

1. **Spring Security Framework:**

   - Built-in authentication & authorization
   - CSRF protection
   - Session management
   - Password encoding (BCrypt)

2. **JWT Implementation:**

   - Stateless authentication
   - Token refresh mechanism
   - Secure token storage

3. **Input Validation:**

   - Bean Validation (Jakarta Validation)
   - Custom validators
   - SQL injection prevention (JPA)

4. **Security Headers:**

   - Content Security Policy
   - XSS Protection
   - HSTS
   - Frame Options

5. **Audit Logging:**
   - Spring AOP for audit trails
   - Security event logging

---

## 📈 Monitoring & Observability

### Spring Boot Actuator:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
```

### Logging:

- SLF4J + Logback
- Structured logging (JSON format)
- Log levels configuration
- Log rotation & retention

### Metrics:

- Micrometer integration
- Prometheus metrics
- Custom business metrics

---

## 🧪 Testing Strategy

### Unit Tests:

- Service layer tests
- Repository tests (with @DataJpaTest)
- Utility class tests

### Integration Tests:

- Controller tests (with @WebMvcTest)
- Security tests (with @SpringBootTest)
- Database integration tests

### Test Coverage:

- Aim for 80%+ code coverage
- Focus on business logic
- API endpoint testing

---

## 📚 Documentation

### API Documentation:

- Swagger/OpenAPI 3.0
- Interactive API documentation
- Request/Response examples

### Code Documentation:

- JavaDoc comments
- README files
- Architecture decision records (ADRs)

---

## 🚢 Deployment Considerations

### Build & Packaging:

- Maven/Gradle build
- Docker containerization
- JAR file deployment

### Environment Configuration:

- application-dev.yml
- application-prod.yml
- Environment variables

### CI/CD Pipeline:

- GitHub Actions / GitLab CI
- Automated testing
- Docker image building
- Deployment automation

---

## 💰 Cost & Resource Analysis

### Development Time:

- **Estimated:** 6-8 weeks
- **Team Size:** 1-2 developers
- **Complexity:** Medium-High

### Infrastructure:

- **Database:** PostgreSQL (existing)
- **Application Server:** Spring Boot (JVM)
- **Memory:** 512MB - 1GB (recommended)
- **CPU:** 1-2 cores (recommended)

### Maintenance:

- **Java Updates:** Regular LTS updates
- **Spring Boot Updates:** Follow release cycle
- **Security Patches:** Regular updates

---

## ✅ Checklist Migration

### Pre-Migration:

- [ ] Backup current system
- [ ] Document all API endpoints
- [ ] Document database schema
- [ ] Identify dependencies
- [ ] Plan rollback strategy

### During Migration:

- [ ] Setup Spring Boot project
- [ ] Migrate database schema
- [ ] Implement core entities
- [ ] Implement repositories
- [ ] Implement services
- [ ] Implement controllers
- [ ] Setup security
- [ ] Implement email service
- [ ] Write tests
- [ ] API documentation

### Post-Migration:

- [ ] Integration testing
- [ ] Performance testing
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Deployment to staging
- [ ] Production deployment
- [ ] Monitor & optimize

---

## 🎓 Learning Resources

### Spring Boot:

- [Spring Boot Official Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Spring Data JPA Guide](https://spring.io/guides/gs/accessing-data-jpa/)

### Best Practices:

- [Spring Boot Best Practices](https://www.baeldung.com/spring-boot-best-practices)
- [REST API Design](https://restfulapi.net/)
- [JWT Authentication](https://www.baeldung.com/spring-security-jwt)

---

## 📞 Next Steps

1. **Review & Approval:** Review kế hoạch này với team
2. **Setup Project:** Tạo Spring Boot project structure
3. **Database Setup:** Cấu hình PostgreSQL connection
4. **Start Implementation:** Bắt đầu với Phase 1

---

**Tài liệu này sẽ được cập nhật thường xuyên trong quá trình migration.**

_Last Updated: [Date]_
_Version: 1.0_
