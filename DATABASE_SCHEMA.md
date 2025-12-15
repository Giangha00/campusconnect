# Sơ đồ Database Chi tiết - CampusConnect

## 📊 Tổng quan

Sơ đồ database này mô tả chi tiết cấu trúc database cho hệ thống CampusConnect, bao gồm các bảng, khóa chính (PK), khóa ngoại (FK) và mối quan hệ giữa các bảng.

---

## 🔗 ERD Diagram (Entity Relationship Diagram)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK id (UUID)    │
│    username     │
│    password      │
│    name         │
│    email        │
│    role         │
│    department   │
│    created_at   │
│    updated_at   │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────┐
│  EVENT_REGISTRATIONS    │
├─────────────────────────┤
│ PK id (UUID)            │
│ FK user_id (UUID)       │◄──┐
│ FK event_id (BIGINT)    │   │
│    ticket_number        │   │
│    registration_date    │   │
│    checked_in           │   │
│    checked_in_at        │   │
│    created_at           │   │
└─────────────────────────┘   │
         │                     │
         │ N:1                 │
         │                     │
         ▼                     │
┌─────────────────┐            │
│     EVENTS      │            │
├─────────────────┤            │
│ PK id (BIGINT)  │            │
│ FK organizer_id │            │
│    title        │            │
│    description  │            │
│    start_date   │            │
│    end_date     │            │
│    venue        │            │
│    category     │            │
│    status       │            │
│    image_url    │            │
│    capacity     │            │
│    reg_start    │            │
│    reg_end      │            │
│    created_at   │            │
│    updated_at   │            │
└────────┬────────┘            │
         │                     │
         │ 1:N                 │
         │                     │
         ▼                     │
┌─────────────────────────┐    │
│   EVENT_BOOKMARKS       │    │
├─────────────────────────┤    │
│ PK id (UUID)            │    │
│ FK user_id (UUID)       │────┘
│ FK event_id (BIGINT)    │
│    created_at           │
└─────────────────────────┘

┌─────────────────┐
│     ADMINS      │
├─────────────────┤
│ PK id (UUID)    │
│    username     │
│    password      │
│    name         │
│    email        │
│    role         │
│    created_at   │
│    updated_at   │
└─────────────────┘

┌─────────────────┐
│     GALLERY     │
├─────────────────┤
│ PK id (BIGINT)  │
│ FK event_id     │──┐
│    image_url    │  │
│    alt_text     │  │
│    year         │  │
│    category     │  │
│    event_name   │  │
│    date         │  │
│    created_at   │  │
└─────────────────┘  │
                      │
                      │ N:1 (optional)
                      │
                      ▼
                 ┌─────────┐
                 │  EVENTS │
                 └─────────┘

┌─────────────────┐
│    FEEDBACK     │
├─────────────────┤
│ PK id (BIGINT)  │
│ FK user_id      │──┐
│ FK event_id     │──┼──┐
│    name         │  │  │
│    email        │  │  │
│    user_type    │  │  │
│    rating       │  │  │
│    feedback     │  │  │
│    status       │  │  │
│    created_at   │  │  │
└─────────────────┘  │  │
                      │  │
                      │  │
                      ▼  ▼
                 ┌─────────┐
                 │  USERS  │
                 │  EVENTS │
                 └─────────┘
```

---

## 📋 Chi tiết các Bảng

### 1. **USERS** - Bảng Người dùng

Bảng lưu trữ thông tin người dùng hệ thống (students, faculty, visitors).

| Column Name  | Data Type    | Constraints                 | Description                     |
| ------------ | ------------ | --------------------------- | ------------------------------- |
| `id`         | UUID         | PRIMARY KEY, NOT NULL       | Unique identifier               |
| `username`   | VARCHAR(50)  | UNIQUE, NOT NULL            | Username để đăng nhập           |
| `password`   | VARCHAR(255) | NOT NULL                    | Password đã hash (BCrypt)       |
| `name`       | VARCHAR(100) | NOT NULL                    | Tên đầy đủ                      |
| `email`      | VARCHAR(100) | UNIQUE, NOT NULL            | Email address                   |
| `role`       | VARCHAR(20)  | NOT NULL, DEFAULT 'student' | Role: student, faculty, visitor |
| `department` | VARCHAR(100) | NULL                        | Khoa/Phòng ban                  |
| `year`       | VARCHAR(10)  | NULL                        | Năm học (cho students)          |
| `created_at` | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Thời gian tạo                   |
| `updated_at` | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Thời gian cập nhật              |

**Indexes:**

- `idx_users_username` ON `username`
- `idx_users_email` ON `email`
- `idx_users_role` ON `role`

**Constraints:**

- `CHECK (role IN ('student', 'faculty', 'visitor'))`
- `CHECK (email LIKE '%@%.%')`

---

### 2. **ADMINS** - Bảng Quản trị viên

Bảng lưu trữ thông tin quản trị viên và giảng viên quản lý.

| Column Name  | Data Type    | Constraints             | Description               |
| ------------ | ------------ | ----------------------- | ------------------------- |
| `id`         | UUID         | PRIMARY KEY, NOT NULL   | Unique identifier         |
| `username`   | VARCHAR(50)  | UNIQUE, NOT NULL        | Username để đăng nhập     |
| `password`   | VARCHAR(255) | NOT NULL                | Password đã hash (BCrypt) |
| `name`       | VARCHAR(100) | NOT NULL                | Tên đầy đủ                |
| `email`      | VARCHAR(100) | UNIQUE, NOT NULL        | Email address             |
| `role`       | VARCHAR(20)  | NOT NULL                | Role: admin, faculty      |
| `created_at` | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Thời gian tạo             |
| `updated_at` | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Thời gian cập nhật        |

**Indexes:**

- `idx_admins_username` ON `username`
- `idx_admins_email` ON `email`
- `idx_admins_role` ON `role`

**Constraints:**

- `CHECK (role IN ('admin', 'faculty'))`

---

### 3. **EVENTS** - Bảng Sự kiện

Bảng lưu trữ thông tin các sự kiện trong khuôn viên.

| Column Name             | Data Type    | Constraints                  | Description                                        |
| ----------------------- | ------------ | ---------------------------- | -------------------------------------------------- |
| `id`                    | BIGSERIAL    | PRIMARY KEY, NOT NULL        | Unique identifier                                  |
| `organizer_id`          | UUID         | FOREIGN KEY → ADMINS(id)     | Người tổ chức (admin/faculty)                      |
| `title`                 | VARCHAR(200) | NOT NULL                     | Tiêu đề sự kiện                                    |
| `description`           | TEXT         | NULL                         | Mô tả chi tiết                                     |
| `start_date`            | TIMESTAMP    | NOT NULL                     | Thời gian bắt đầu                                  |
| `end_date`              | TIMESTAMP    | NULL                         | Thời gian kết thúc                                 |
| `venue`                 | VARCHAR(200) | NULL                         | Địa điểm                                           |
| `category`              | VARCHAR(50)  | NOT NULL                     | Loại: academic, cultural, sports, technical        |
| `status`                | VARCHAR(20)  | NOT NULL, DEFAULT 'upcoming' | Trạng thái: incoming, upcoming, ongoing, completed |
| `image_url`             | VARCHAR(500) | NULL                         | URL hình ảnh                                       |
| `registration_required` | BOOLEAN      | NOT NULL, DEFAULT true       | Yêu cầu đăng ký                                    |
| `capacity`              | INTEGER      | NULL                         | Sức chứa (NULL = không giới hạn)                   |
| `registration_start`    | TIMESTAMP    | NULL                         | Thời gian bắt đầu đăng ký                          |
| `registration_end`      | TIMESTAMP    | NULL                         | Thời gian kết thúc đăng ký                         |
| `created_at`            | TIMESTAMP    | NOT NULL, DEFAULT NOW()      | Thời gian tạo                                      |
| `updated_at`            | TIMESTAMP    | NOT NULL, DEFAULT NOW()      | Thời gian cập nhật                                 |

**Indexes:**

- `idx_events_organizer` ON `organizer_id`
- `idx_events_category` ON `category`
- `idx_events_status` ON `status`
- `idx_events_start_date` ON `start_date`
- `idx_events_registration` ON `registration_start`, `registration_end`

**Foreign Keys:**

- `fk_events_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL

**Constraints:**

- `CHECK (category IN ('academic', 'cultural', 'sports', 'technical'))`
- `CHECK (status IN ('incoming', 'upcoming', 'ongoing', 'completed', 'cancelled'))`
- `CHECK (end_date IS NULL OR end_date >= start_date)`
- `CHECK (registration_end IS NULL OR registration_end >= registration_start)`

---

### 4. **EVENT_REGISTRATIONS** - Bảng Đăng ký Sự kiện

Bảng lưu trữ thông tin đăng ký của người dùng cho các sự kiện (Many-to-Many relationship).

| Column Name         | Data Type   | Constraints              | Description                |
| ------------------- | ----------- | ------------------------ | -------------------------- |
| `id`                | UUID        | PRIMARY KEY, NOT NULL    | Unique identifier          |
| `user_id`           | UUID        | FOREIGN KEY → USERS(id)  | Người dùng đăng ký         |
| `event_id`          | BIGINT      | FOREIGN KEY → EVENTS(id) | Sự kiện được đăng ký       |
| `ticket_number`     | VARCHAR(50) | UNIQUE, NOT NULL         | Số vé (format: TCK-XXXXXX) |
| `registration_date` | TIMESTAMP   | NOT NULL, DEFAULT NOW()  | Thời gian đăng ký          |
| `checked_in`        | BOOLEAN     | NOT NULL, DEFAULT false  | Đã check-in chưa           |
| `checked_in_at`     | TIMESTAMP   | NULL                     | Thời gian check-in         |
| `created_at`        | TIMESTAMP   | NOT NULL, DEFAULT NOW()  | Thời gian tạo              |
| `updated_at`        | TIMESTAMP   | NOT NULL, DEFAULT NOW()  | Thời gian cập nhật         |

**Indexes:**

- `idx_registrations_user` ON `user_id`
- `idx_registrations_event` ON `event_id`
- `idx_registrations_ticket` ON `ticket_number`
- `UNIQUE idx_registrations_user_event` ON (`user_id`, `event_id`)

**Foreign Keys:**

- `fk_registrations_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- `fk_registrations_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE

**Constraints:**

- `UNIQUE (user_id, event_id)` - Một user chỉ đăng ký một lần cho mỗi event

---

### 5. **EVENT_BOOKMARKS** - Bảng Bookmark Sự kiện

Bảng lưu trữ các sự kiện được bookmark bởi người dùng (Many-to-Many relationship).

| Column Name  | Data Type | Constraints              | Description           |
| ------------ | --------- | ------------------------ | --------------------- |
| `id`         | UUID      | PRIMARY KEY, NOT NULL    | Unique identifier     |
| `user_id`    | UUID      | FOREIGN KEY → USERS(id)  | Người dùng bookmark   |
| `event_id`   | BIGINT    | FOREIGN KEY → EVENTS(id) | Sự kiện được bookmark |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW()  | Thời gian bookmark    |

**Indexes:**

- `idx_bookmarks_user` ON `user_id`
- `idx_bookmarks_event` ON `event_id`
- `UNIQUE idx_bookmarks_user_event` ON (`user_id`, `event_id`)

**Foreign Keys:**

- `fk_bookmarks_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- `fk_bookmarks_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE

**Constraints:**

- `UNIQUE (user_id, event_id)` - Một user chỉ bookmark một lần cho mỗi event

---

### 6. **GALLERY** - Bảng Thư viện Ảnh

Bảng lưu trữ hình ảnh từ các sự kiện đã diễn ra.

| Column Name  | Data Type    | Constraints              | Description                                 |
| ------------ | ------------ | ------------------------ | ------------------------------------------- |
| `id`         | BIGSERIAL    | PRIMARY KEY, NOT NULL    | Unique identifier                           |
| `event_id`   | BIGINT       | FOREIGN KEY → EVENTS(id) | Sự kiện liên quan (optional)                |
| `image_url`  | VARCHAR(500) | NOT NULL                 | URL hình ảnh                                |
| `alt_text`   | VARCHAR(200) | NULL                     | Mô tả hình ảnh                              |
| `year`       | VARCHAR(10)  | NOT NULL                 | Năm sự kiện                                 |
| `category`   | VARCHAR(50)  | NOT NULL                 | Loại: academic, cultural, sports, technical |
| `event_name` | VARCHAR(200) | NULL                     | Tên sự kiện                                 |
| `date`       | DATE         | NULL                     | Ngày chụp ảnh                               |
| `created_at` | TIMESTAMP    | NOT NULL, DEFAULT NOW()  | Thời gian tạo                               |
| `updated_at` | TIMESTAMP    | NOT NULL, DEFAULT NOW()  | Thời gian cập nhật                          |

**Indexes:**

- `idx_gallery_event` ON `event_id`
- `idx_gallery_year` ON `year`
- `idx_gallery_category` ON `category`
- `idx_gallery_date` ON `date`

**Foreign Keys:**

- `fk_gallery_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE SET NULL

**Constraints:**

- `CHECK (category IN ('academic', 'cultural', 'sports', 'technical'))`

---

### 7. **FEEDBACK** - Bảng Phản hồi

Bảng lưu trữ phản hồi từ người dùng về các sự kiện.

| Column Name  | Data Type    | Constraints                | Description                     |
| ------------ | ------------ | -------------------------- | ------------------------------- |
| `id`         | BIGSERIAL    | PRIMARY KEY, NOT NULL      | Unique identifier               |
| `user_id`    | UUID         | FOREIGN KEY → USERS(id)    | Người dùng gửi feedback         |
| `event_id`   | BIGINT       | FOREIGN KEY → EVENTS(id)   | Sự kiện được feedback           |
| `name`       | VARCHAR(100) | NOT NULL                   | Tên người gửi                   |
| `email`      | VARCHAR(100) | NOT NULL                   | Email người gửi                 |
| `user_type`  | VARCHAR(20)  | NOT NULL                   | Loại: student, faculty, visitor |
| `rating`     | INTEGER      | NOT NULL                   | Đánh giá (1-5)                  |
| `feedback`   | TEXT         | NOT NULL                   | Nội dung phản hồi               |
| `status`     | VARCHAR(20)  | NOT NULL, DEFAULT 'active' | Trạng thái: active, hidden      |
| `created_at` | TIMESTAMP    | NOT NULL, DEFAULT NOW()    | Thời gian tạo                   |
| `updated_at` | TIMESTAMP    | NOT NULL, DEFAULT NOW()    | Thời gian cập nhật              |

**Indexes:**

- `idx_feedback_user` ON `user_id`
- `idx_feedback_event` ON `event_id`
- `idx_feedback_status` ON `status`
- `idx_feedback_rating` ON `rating`
- `idx_feedback_created` ON `created_at`

**Foreign Keys:**

- `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
- `fk_feedback_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE SET NULL

**Constraints:**

- `CHECK (user_type IN ('student', 'faculty', 'visitor'))`
- `CHECK (rating >= 1 AND rating <= 5)`
- `CHECK (status IN ('active', 'hidden'))`

---

## 🔗 Mối quan hệ giữa các Bảng

### 1. **USERS ↔ EVENTS** (Many-to-Many)

- **Quan hệ:** Một user có thể đăng ký nhiều events, một event có nhiều users đăng ký
- **Bảng trung gian:** `EVENT_REGISTRATIONS`
- **Foreign Keys:**
  - `EVENT_REGISTRATIONS.user_id` → `USERS.id`
  - `EVENT_REGISTRATIONS.event_id` → `EVENTS.id`

### 2. **USERS ↔ EVENTS** (Many-to-Many - Bookmarks)

- **Quan hệ:** Một user có thể bookmark nhiều events, một event có thể được bookmark bởi nhiều users
- **Bảng trung gian:** `EVENT_BOOKMARKS`
- **Foreign Keys:**
  - `EVENT_BOOKMARKS.user_id` → `USERS.id`
  - `EVENT_BOOKMARKS.event_id` → `EVENTS.id`

### 3. **ADMINS → EVENTS** (One-to-Many)

- **Quan hệ:** Một admin có thể tổ chức nhiều events
- **Foreign Key:**
  - `EVENTS.organizer_id` → `ADMINS.id`

### 4. **EVENTS → GALLERY** (One-to-Many - Optional)

- **Quan hệ:** Một event có thể có nhiều hình ảnh trong gallery
- **Foreign Key:**
  - `GALLERY.event_id` → `EVENTS.id` (nullable)

### 5. **USERS → FEEDBACK** (One-to-Many)

- **Quan hệ:** Một user có thể gửi nhiều feedback
- **Foreign Key:**
  - `FEEDBACK.user_id` → `USERS.id`

### 6. **EVENTS → FEEDBACK** (One-to-Many)

- **Quan hệ:** Một event có thể nhận nhiều feedback
- **Foreign Key:**
  - `FEEDBACK.event_id` → `EVENTS.id`

---

## 📊 Tóm tắt Mối quan hệ

| Bảng 1 | Quan hệ | Bảng 2   | Bảng trung gian (nếu có) | FK trong bảng trung gian |
| ------ | ------- | -------- | ------------------------ | ------------------------ |
| USERS  | N:M     | EVENTS   | EVENT_REGISTRATIONS      | user_id, event_id        |
| USERS  | N:M     | EVENTS   | EVENT_BOOKMARKS          | user_id, event_id        |
| ADMINS | 1:N     | EVENTS   | -                        | organizer_id             |
| EVENTS | 1:N     | GALLERY  | -                        | event_id                 |
| USERS  | 1:N     | FEEDBACK | -                        | user_id                  |
| EVENTS | 1:N     | FEEDBACK | -                        | event_id                 |

---

## 🔑 Primary Keys (PK)

| Bảng                  | Primary Key | Type      |
| --------------------- | ----------- | --------- |
| `users`               | `id`        | UUID      |
| `admins`              | `id`        | UUID      |
| `events`              | `id`        | BIGSERIAL |
| `event_registrations` | `id`        | UUID      |
| `event_bookmarks`     | `id`        | UUID      |
| `gallery`             | `id`        | BIGSERIAL |
| `feedback`            | `id`        | BIGSERIAL |

---

## 🔗 Foreign Keys (FK)

| Bảng                  | Foreign Key Column | References Table | References Column | On Delete |
| --------------------- | ------------------ | ---------------- | ----------------- | --------- |
| `events`              | `organizer_id`     | `admins`         | `id`              | SET NULL  |
| `event_registrations` | `user_id`          | `users`          | `id`              | CASCADE   |
| `event_registrations` | `event_id`         | `events`         | `id`              | CASCADE   |
| `event_bookmarks`     | `user_id`          | `users`          | `id`              | CASCADE   |
| `event_bookmarks`     | `event_id`         | `events`         | `id`              | CASCADE   |
| `gallery`             | `event_id`         | `events`         | `id`              | SET NULL  |
| `feedback`            | `user_id`          | `users`          | `id`              | SET NULL  |
| `feedback`            | `event_id`         | `events`         | `id`              | SET NULL  |

---

## 📈 Indexes Strategy

### Performance Indexes:

1. **Users Table:**

   - `username` - Tìm kiếm đăng nhập
   - `email` - Tìm kiếm theo email
   - `role` - Filter theo role

2. **Events Table:**

   - `organizer_id` - Tìm events của organizer
   - `category` - Filter theo category
   - `status` - Filter theo status
   - `start_date` - Sắp xếp theo thời gian
   - Composite: `(registration_start, registration_end)` - Tìm events đang mở đăng ký

3. **Event Registrations:**

   - `user_id` - Tìm registrations của user
   - `event_id` - Tìm users đã đăng ký event
   - `ticket_number` - Tìm kiếm theo ticket
   - Composite UNIQUE: `(user_id, event_id)` - Đảm bảo không trùng

4. **Event Bookmarks:**

   - `user_id` - Tìm bookmarks của user
   - `event_id` - Tìm users đã bookmark
   - Composite UNIQUE: `(user_id, event_id)` - Đảm bảo không trùng

5. **Gallery:**

   - `event_id` - Tìm ảnh của event
   - `year` - Filter theo năm
   - `category` - Filter theo category

6. **Feedback:**
   - `user_id` - Tìm feedback của user
   - `event_id` - Tìm feedback của event
   - `status` - Filter theo status
   - `rating` - Sắp xếp theo rating
   - `created_at` - Sắp xếp theo thời gian

---

## 🗄️ SQL Schema Script

```sql
-- ============================================
-- CampusConnect Database Schema
-- PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    department VARCHAR(100),
    year VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('student', 'faculty', 'visitor')),
    CONSTRAINT chk_users_email CHECK (email LIKE '%@%.%')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. ADMINS TABLE
-- ============================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_admins_role CHECK (role IN ('admin', 'faculty'))
);

CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);

-- ============================================
-- 3. EVENTS TABLE
-- ============================================
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    organizer_id UUID,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    venue VARCHAR(200),
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
    image_url VARCHAR(500),
    registration_required BOOLEAN NOT NULL DEFAULT true,
    capacity INTEGER,
    registration_start TIMESTAMP,
    registration_end TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id)
        REFERENCES admins(id) ON DELETE SET NULL,
    CONSTRAINT chk_events_category CHECK (category IN ('academic', 'cultural', 'sports', 'technical')),
    CONSTRAINT chk_events_status CHECK (status IN ('incoming', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    CONSTRAINT chk_events_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_events_reg_dates CHECK (registration_end IS NULL OR registration_end >= registration_start)
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_registration ON events(registration_start, registration_end);

-- ============================================
-- 4. EVENT_REGISTRATIONS TABLE
-- ============================================
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    event_id BIGINT NOT NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checked_in BOOLEAN NOT NULL DEFAULT false,
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id)
        REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT uk_registrations_user_event UNIQUE (user_id, event_id)
);

CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_ticket ON event_registrations(ticket_number);

-- ============================================
-- 5. EVENT_BOOKMARKS TABLE
-- ============================================
CREATE TABLE event_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    event_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmarks_event FOREIGN KEY (event_id)
        REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT uk_bookmarks_user_event UNIQUE (user_id, event_id)
);

CREATE INDEX idx_bookmarks_user ON event_bookmarks(user_id);
CREATE INDEX idx_bookmarks_event ON event_bookmarks(event_id);

-- ============================================
-- 6. GALLERY TABLE
-- ============================================
CREATE TABLE gallery (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    year VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    event_name VARCHAR(200),
    date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gallery_event FOREIGN KEY (event_id)
        REFERENCES events(id) ON DELETE SET NULL,
    CONSTRAINT chk_gallery_category CHECK (category IN ('academic', 'cultural', 'sports', 'technical'))
);

CREATE INDEX idx_gallery_event ON gallery(event_id);
CREATE INDEX idx_gallery_year ON gallery(year);
CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_gallery_date ON gallery(date);

-- ============================================
-- 7. FEEDBACK TABLE
-- ============================================
CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    event_id BIGINT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    rating INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_feedback_event FOREIGN KEY (event_id)
        REFERENCES events(id) ON DELETE SET NULL,
    CONSTRAINT chk_feedback_user_type CHECK (user_type IN ('student', 'faculty', 'visitor')),
    CONSTRAINT chk_feedback_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_feedback_status CHECK (status IN ('active', 'hidden'))
);

CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_event ON feedback(event_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_created ON feedback(created_at);

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 📝 Notes & Best Practices

### 1. **UUID vs BIGSERIAL:**

- **UUID:** Sử dụng cho `users`, `admins`, `event_registrations`, `event_bookmarks`
  - Ưu điểm: Unique globally, không thể đoán được
  - Nhược điểm: Tốn nhiều storage hơn, index chậm hơn một chút
- **BIGSERIAL:** Sử dụng cho `events`, `gallery`, `feedback`
  - Ưu điểm: Nhỏ gọn, index nhanh, dễ đọc
  - Nhược điểm: Có thể đoán được

### 2. **CASCADE vs SET NULL:**

- **CASCADE:** Khi xóa user/event, xóa luôn registrations và bookmarks
- **SET NULL:** Khi xóa admin/event, giữ lại feedback và gallery nhưng set FK = NULL

### 3. **Indexes:**

- Tạo indexes cho các cột thường xuyên được query
- Composite indexes cho các query phức tạp
- UNIQUE indexes để đảm bảo tính toàn vẹn dữ liệu

### 4. **Constraints:**

- CHECK constraints để đảm bảo dữ liệu hợp lệ
- NOT NULL cho các trường bắt buộc
- DEFAULT values cho các trường có giá trị mặc định

### 5. **Timestamps:**

- `created_at`: Tự động set khi tạo
- `updated_at`: Tự động update khi có thay đổi (via trigger)

---

## 🔄 Migration từ Drizzle Schema

Nếu đang sử dụng Drizzle ORM, có thể migrate schema hiện tại sang PostgreSQL schema này bằng cách:

1. Export schema từ Drizzle
2. Map các types sang PostgreSQL types
3. Tạo migration scripts
4. Chạy migration

---

**Tài liệu này sẽ được cập nhật khi có thay đổi trong database schema.**

_Last Updated: [Date]_
_Version: 1.0_
