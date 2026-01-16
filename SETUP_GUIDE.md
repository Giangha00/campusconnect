# CampusConnect - Development Environment Setup Guide

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Database Setup (MySQL)](#database-setup-mysql)
3. [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
4. [Frontend Setup (React)](#frontend-setup-react)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 System Requirements

### Required Software:

1. **Java Development Kit (JDK)**

   - Version: JDK 17 or higher
   - Download: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
   - Verify: `java -version`

2. **Node.js and npm**

   - Version: Node.js 18.x or higher
   - npm: 9.x or higher (comes with Node.js)
   - Download: [Node.js Official](https://nodejs.org/)
   - Verify:
     ```bash
     node -v
     npm -v
     ```

3. **MySQL Server**

   - Version: MySQL 8.0 or higher
   - Download: [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
   - Or use XAMPP/WAMP (includes MySQL)
   - Verify: `mysql --version`

4. **Maven** (Optional - Spring Boot includes Maven Wrapper)

   - Version: 3.6.x or higher
   - Download: [Apache Maven](https://maven.apache.org/download.cgi)
   - Verify: `mvn -v`

5. **Git** (To clone repository)

   - Download: [Git Official](https://git-scm.com/downloads)
   - Verify: `git --version`

6. **IDE** (Recommended)
   - IntelliJ IDEA (for Java/Spring Boot)
   - Visual Studio Code (for React/TypeScript)
   - Or any IDE supporting Java and TypeScript

---

## 🗄️ Database Setup (MySQL)

### Step 1: Install MySQL Server

1. **Windows:**

   - Download MySQL Installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
   - Run installer and follow the instructions
   - Remember the root password (default: `root`)

2. **macOS:**

   ```bash
   # Using Homebrew
   brew install mysql
   brew services start mysql
   ```

3. **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install mysql-server
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

### Step 2: Create Database

1. **Open MySQL Command Line or MySQL Workbench**

2. **Login as root:**

   ```bash
   mysql -u root -p
   # Enter password when prompted
   ```

3. **Create database:**

   ```sql
   CREATE DATABASE campusconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Create user (Optional - can use root):**

   ```sql
   CREATE USER 'campusconnect'@'localhost' IDENTIFIED BY 'password123';
   GRANT ALL PRIVILEGES ON campusconnect.* TO 'campusconnect'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Verify database created:**
   ```sql
   SHOW DATABASES;
   USE campusconnect;
   ```

### Step 3: Import Database Schema (If SQL file available)

If you have a SQL schema file:

```bash
mysql -u root -p campusconnect < database_schema.sql
```

**Note:** Spring Boot will automatically create tables based on JPA Entities on first run (if `spring.jpa.hibernate.ddl-auto=update`), but in this project it's set to `ddl-auto=none`, so you need to create schema manually or import from SQL file.

---

## ⚙️ Backend Setup (Spring Boot)

### Step 1: Clone or open project

```bash
# If cloning from Git
git clone <repository-url>
cd campusconnect_backend

# Or open existing project folder
cd D:\2. Vincent\DEV\campusconnect_backend
```

### Step 2: Configure Database

1. **Open file:** `src/main/resources/application.properties`

2. **Update MySQL connection information:**

   ```properties
   # Datasource (MySQL 8+)
   spring.datasource.url=jdbc:mysql://localhost:3306/campusconnect
   spring.datasource.username=root
   spring.datasource.password=root  # Change to your password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   ```

3. **Verify JPA settings:**
   ```properties
   spring.jpa.hibernate.ddl-auto=none  # Don't auto-create schema
   spring.jpa.show-sql=true            # Show SQL queries (dev only)
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
   ```

### Step 3: Build and Run Backend

**Method 1: Using Maven Wrapper (Recommended)**

```bash
# Windows
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw clean install
./mvnw spring-boot:run
```

**Method 2: Using Maven (if installed)**

```bash
mvn clean install
mvn spring-boot:run
```

**Method 3: Run from IDE (IntelliJ IDEA)**

1. Open project in IntelliJ IDEA
2. Find file: `src/main/java/com/example/campusconnet_backend/CampusconnetBackendApplication.java`
3. Right-click → Run 'CampusconnetBackendApplication'
4. Or find Run Configuration → Spring Boot

### Step 4: Verify Backend is Running

- Open browser: `http://localhost:8080`
- Or test API: `http://localhost:8080/api/events`
- Backend will run on port **8080**

**Note:** If you encounter port already in use error, you can:

- Change port in `application.properties`: `server.port=8081`
- Or stop the application using port 8080

---

## 🎨 Frontend Setup (React)

### Step 1: Navigate to Frontend Directory

```bash
cd D:\2. Vincent\DEV\campusconnect
```

### Step 2: Install Dependencies

```bash
# Install all packages
npm install

# Or if using yarn
yarn install
```

**Note:** This process may take a few minutes depending on network speed.

### Step 3: Configure Environment Variables (Optional)

Create `.env` file in root directory (if needed):

```env
# Email Configuration (for Node.js server - optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database URL (for Drizzle - not needed as using Spring Boot)
# DATABASE_URL=postgresql://...
```

**Note:** Frontend primarily connects to Spring Boot backend at `http://localhost:8080/api`, no direct database configuration needed.

### Step 4: Run Frontend Development Server

```bash
# Run development server
npm run dev

# Or if using yarn
yarn dev
```

Frontend will run on: `http://localhost:3000`

**Note:**

- Frontend uses Vite dev server
- Hot Module Replacement (HMR) will automatically reload on code changes
- If port 3000 is already in use, Vite will automatically choose another port

### Step 5: Build for Production (Optional - only when needed)

```bash
npm run build
```

Build files will be created in `dist/public` directory

---

## 🔐 Environment Configuration

### 1. Backend Configuration

**File:** `campusconnect_backend/src/main/resources/application.properties`

```properties
# App info
spring.application.name=campusconnect_backend
server.port=8080

# Datasource (MySQL 8+)
spring.datasource.url=jdbc:mysql://localhost:3306/campusconnect
spring.datasource.username=root
spring.datasource.password=root  # ⚠️ Change to your password

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true
```

### 2. Frontend Configuration

**File:** `client/src/lib/api/api-client.ts`

API base URL is already configured:

```typescript
const API_BASE_URL = "http://localhost:8080/api";
```

If backend runs on a different port, update this file.

### 3. Email Configuration (Optional)

If you want to use email functionality:

1. **Create App Password for Gmail:**

   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Create a new app password

2. **Create `.env` file in root directory:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-here
   ```

---

## 🚀 Running the Application

### Startup Order:

1. **Step 1: Start MySQL**

   ```bash
   # Windows (XAMPP)
   # Open XAMPP Control Panel → Start MySQL

   # Linux/macOS
   sudo systemctl start mysql
   # or
   brew services start mysql
   ```

2. **Step 2: Start Backend (Spring Boot)**

   ```bash
   cd campusconnect_backend
   ./mvnw spring-boot:run
   # Or run from IDE
   ```

   Wait until you see log:

   ```
   Started CampusconnetBackendApplication in X.XXX seconds
   ```

3. **Step 3: Start Frontend (React)**

   ```bash
   cd campusconnect
   npm run dev
   ```

   Wait until you see:

   ```
   VITE v5.x.x  ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```

### Access the Application:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **Admin Login:** http://localhost:3000/admin

---

## ✅ Troubleshooting

### Connection Checks:

1. **Check MySQL:**

   ```bash
   mysql -u root -p
   # Enter password
   USE campusconnect;
   SHOW TABLES;
   ```

2. **Check Backend:**

   - Open: http://localhost:8080/api/events
   - If you see JSON response → Backend is working
   - If 404 error → Check routes in Controller

3. **Check Frontend:**
   - Open: http://localhost:3000
   - Check Console (F12) for errors
   - Check Network tab to see if API calls are successful

### Common Issues:

#### 1. **Error: Port 8080 already in use**

```
Error: Port 8080 is already in use
```

**Solution:**

- Find and stop process using port 8080:

  ```bash
  # Windows
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F

  # Linux/macOS
  lsof -ti:8080 | xargs kill -9
  ```

- Or change port in `application.properties`

#### 2. **Error: Cannot connect to MySQL**

```
Communications link failure
```

**Solution:**

- Check if MySQL is running
- Verify username/password in `application.properties`
- Verify database `campusconnect` is created
- Check MySQL is running on port 3306

#### 3. **Error: Frontend cannot connect to Backend**

```
API Error: Cannot connect to backend server
```

**Solution:**

- Check if Backend is running (http://localhost:8080)
- Check CORS settings in Spring Boot (if any)
- Verify API_BASE_URL in `api-client.ts`

#### 4. **Error: npm install fails**

```
npm ERR! code ERESOLVE
```

**Solution:**

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Or use --legacy-peer-deps
npm install --legacy-peer-deps
```

#### 5. **Error: Maven build fails**

```
[ERROR] Failed to execute goal
```

**Solution:**

```bash
# Clean and rebuild
./mvnw clean install

# Or clear .m2 cache (if needed)
rm -rf ~/.m2/repository
```

### Checking Logs:

1. **Backend Logs:**

   - View in console/terminal where Spring Boot is running
   - Or in IDE console

2. **Frontend Logs:**
   - Open Browser Console (F12)
   - Check Network tab to verify API calls
   - Check Console tab for JavaScript errors

---

## 📝 Quick Reference Commands

### Backend:

```bash
# Build
./mvnw clean install

# Run
./mvnw spring-boot:run

# Test
./mvnw test
```

### Frontend:

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production
npm run build

# Type checking
npm run check
```

### Database:

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE campusconnect;

# Import schema (if available)
mysql -u root -p campusconnect < schema.sql
```

---

## 🎯 Next Steps

After successful installation:

1. ✅ Create first Admin account (via database or API)
2. ✅ Import sample data (if available)
3. ✅ Test main features:
   - View events list
   - Register for events
   - Admin dashboard
   - Gallery
   - Feedback

---

## 📞 Support

If you encounter issues, check:

- Logs in console/terminal
- Browser Console (F12)
- Database connection
- Port conflicts
- Environment variables

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Happy Coding! 🎉**
