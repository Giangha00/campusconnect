# XSS Protection Documentation

## Tổng quan

Tài liệu này giải thích các cơ chế bảo mật XSS (Cross-Site Scripting) đã được triển khai trong hệ thống CampusConnect, dựa trên các best practices từ [PortSwigger Web Security Academy](https://portswigger.net/web-security/cross-site-scripting).

## Các lớp bảo vệ XSS

Hệ thống sử dụng nhiều lớp bảo vệ để ngăn chặn các cuộc tấn công XSS:

### 1. Content-Security-Policy (CSP)

**Vị trí:** `server/index.ts` và `client/index.html`

**Mô tả:** CSP là một lớp bảo vệ quan trọng nhất, kiểm soát các tài nguyên mà trình duyệt được phép tải và thực thi.

**Cấu hình hiện tại:**
```javascript
default-src 'self'                    // Chỉ cho phép tài nguyên từ cùng origin
script-src 'self' 'unsafe-inline'     // Script chỉ từ cùng origin (unsafe-inline cho Vite HMR)
style-src 'self' 'unsafe-inline'      // CSS chỉ từ cùng origin (unsafe-inline cho Tailwind)
img-src 'self' data: https: http:     // Cho phép hình ảnh từ mọi nguồn HTTPS/HTTP
frame-src 'none'                      // Chặn tất cả iframe
object-src 'none'                     // Chặn object/embed tags
base-uri 'self'                       // Giới hạn base tag
form-action 'self'                    // Form chỉ submit đến cùng origin
frame-ancestors 'none'                // Ngăn clickjacking
```

**Cách hoạt động:**
- Khi một script độc hại cố gắng thực thi, CSP sẽ chặn nó ngay cả khi nó đã được inject vào DOM
- CSP hoạt động ở cấp trình duyệt, không phụ thuộc vào server-side sanitization

### 2. HTML Escaping

**Vị trí:** `client/src/lib/xss-protection.ts` - hàm `escapeHtml()`

**Mô tả:** Chuyển đổi các ký tự đặc biệt HTML thành HTML entities để ngăn chúng được hiểu là HTML.

**Cách hoạt động:**
```typescript
'<' → '&lt;'
'>' → '&gt;'
'&' → '&amp;'
'"' → '&quot;'
"'" → '&#x27;'
'/' → '&#x2F;'
```

**Ví dụ:**
```javascript
Input:  <script>alert("XSS")</script>
Output: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

**Khi nào sử dụng:**
- Khi hiển thị plain text từ user input
- Khi không cần HTML formatting
- Component `SafeText` tự động escape tất cả content

### 3. URL Sanitization

**Vị trí:** `client/src/lib/xss-protection.ts` - hàm `sanitizeUrl()` và `isSafeUrl()`

**Mô tả:** Kiểm tra và chặn các URL nguy hiểm như `javascript:`, `data:`, `vbscript:`, v.v.

**Các protocol bị chặn:**
- `javascript:` - Thực thi JavaScript
- `data:` - Data URI có thể chứa HTML/JavaScript
- `vbscript:` - VBScript (IE)
- `file:` - Truy cập file system
- `about:` - About protocol

**Cách hoạt động:**
```typescript
// Kiểm tra protocol nguy hiểm
isSafeUrl('javascript:alert("XSS")')  // false
isSafeUrl('https://example.com')     // true

// Sanitize URL
sanitizeUrl('javascript:alert("XSS")')  // '' (blocked)
sanitizeUrl('https://example.com')       // 'https://example.com'
```

**Bảo vệ chống lại:**
- URL encoding bypass (`javascript%3A...`)
- Whitespace injection (`javascript :alert(...)`)
- Event handler trong URL (`onerror=alert(...)`)

### 4. HTML Sanitization với DOMPurify

**Vị trí:** `client/src/lib/xss-protection.ts` - hàm `sanitizeHtml()`

**Mô tả:** Cho phép một số HTML tags an toàn nhưng loại bỏ các tags và attributes nguy hiểm.

**Tags được phép:**
- `b`, `i`, `em`, `strong` - Formatting
- `a`, `p`, `br` - Structure
- `ul`, `ol`, `li` - Lists
- `span` - Inline

**Tags bị chặn:**
- `script`, `iframe`, `object`, `embed` - Có thể thực thi code
- `form`, `input`, `button` - Có thể submit dữ liệu

**Attributes bị chặn:**
- `onerror`, `onload`, `onclick`, `onmouseover` - Event handlers
- Chỉ cho phép `href`, `target`, `class`

**Ví dụ:**
```javascript
Input:  <b>Bold</b><script>alert("XSS")</script>
Output: <b>Bold</b>
```

### 5. Security Headers

**Vị trí:** `server/index.ts`

**Các headers được thiết lập:**

1. **X-XSS-Protection**
   ```
   X-XSS-Protection: 1; mode=block
   ```
   - Kích hoạt XSS filter của trình duyệt (legacy nhưng vẫn hữu ích)

2. **X-Content-Type-Options**
   ```
   X-Content-Type-Options: nosniff
   ```
   - Ngăn MIME type sniffing, buộc trình duyệt sử dụng Content-Type được chỉ định

3. **X-Frame-Options**
   ```
   X-Frame-Options: DENY
   ```
   - Ngăn trang web được embed trong iframe (chống clickjacking)

4. **Referrer-Policy**
   ```
   Referrer-Policy: strict-origin-when-cross-origin
   ```
   - Kiểm soát thông tin referrer được gửi đi

## Các loại tấn công XSS được bảo vệ

### 1. Reflected XSS
**Mô tả:** Payload được phản ánh ngay lập tức trong response.

**Ví dụ:**
```javascript
// URL: /search?q=<script>alert("XSS")</script>
// Response: <div>Search results for: <script>alert("XSS")</script></div>
```

**Bảo vệ:** HTML escaping tự động với `SafeText` component.

### 2. Stored XSS
**Mô tả:** Payload được lưu trữ trong database và hiển thị cho nhiều người dùng.

**Ví dụ:**
```javascript
// User input: <img src=x onerror=alert("XSS")>
// Stored in DB, displayed to all users
```

**Bảo vệ:** Tất cả user input được escape trước khi lưu và hiển thị.

### 3. DOM-based XSS
**Mô tả:** Payload được inject vào DOM thông qua JavaScript.

**Ví dụ:**
```javascript
document.getElementById('output').innerHTML = userInput; // Dangerous!
```

**Bảo vệ:** 
- CSP ngăn script độc hại thực thi
- Sử dụng `SafeText` thay vì `innerHTML`
- DOMPurify sanitize HTML nếu cần

### 4. URL-based XSS
**Mô tả:** Payload trong URL parameters hoặc hash.

**Ví dụ:**
```javascript
// URL: /page#javascript:alert("XSS")
// Used in: <a href={location.hash}>
```

**Bảo vệ:** `sanitizeUrl()` chặn tất cả dangerous protocols.

### 5. Event Handler XSS
**Mô tả:** Sử dụng event handlers như `onerror`, `onload`, `onclick`.

**Ví dụ:**
```html
<img src=x onerror=alert("XSS")>
<div onclick="alert('XSS')">Click</div>
```

**Bảo vệ:** 
- HTML escaping loại bỏ event handlers
- DOMPurify có `FORBID_ATTR` chặn event handlers

## Cách sử dụng trong code

### 1. Hiển thị Plain Text
```tsx
import { SafeText } from '@/components/common/safe-text';

// ✅ Đúng - Tự động escape
<SafeText>{userInput}</SafeText>

// ❌ Sai - Không escape
<div>{userInput}</div>
```

### 2. Hiển thị HTML có format
```tsx
import { sanitizeHtml } from '@/lib/xss-protection';

// ✅ Đúng - Sanitize HTML
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />

// ❌ Sai - Không sanitize
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 3. Sử dụng URL
```tsx
import { safeUrl } from '@/components/common/safe-text';

// ✅ Đúng - Sanitize URL
<img src={safeUrl(userUrl)} alt="Image" />
<a href={safeUrl(userUrl)}>Link</a>

// ❌ Sai - Không sanitize
<img src={userUrl} alt="Image" />
```

### 4. HTML Attributes
```tsx
import { sanitizeAttribute } from '@/components/common/safe-text';

// ✅ Đúng - Sanitize attribute
<img alt={sanitizeAttribute(userInput)} />

// ❌ Sai - Không sanitize
<img alt={userInput} />
```

## Testing & Attack Simulation

### Chạy Basic Tests
1. Truy cập `/xss-test`
2. Click "Run XSS Protection Tests"
3. Xem kết quả trong UI và browser console

### Chạy Attack Simulation
1. Truy cập `/xss-test`
2. Chuyển sang tab "Attack Simulation"
3. Click "Run Attack Simulation"
4. Xem kết quả chi tiết trong browser console

### Console Commands
```javascript
// Chạy basic tests
testXSS()

// Chạy comprehensive attack simulation
simulateXSSAttacks()
```

## Attack Vectors Tested

Hệ thống test bao gồm **30+ attack vectors**:

1. **Script Injection**
   - Basic script tags
   - Encoded script tags
   - Mixed case bypass
   - Null byte injection

2. **Image-based Attacks**
   - Image with onerror
   - SVG with onload
   - Broken image source

3. **Event Handlers**
   - onerror, onload, onclick
   - onfocus, onmouseover
   - Body/div event handlers

4. **JavaScript Protocol**
   - Direct javascript: URLs
   - URL-encoded javascript:
   - Whitespace injection

5. **Data URI Attacks**
   - Data URI with HTML
   - Data URI with SVG
   - Data URI with script

6. **Iframe/Object Attacks**
   - Iframe with javascript:
   - Object/embed tags
   - Data URI in iframe

7. **Encoding Bypasses**
   - HTML entity encoding
   - Unicode encoding
   - Mixed case

8. **Advanced Attacks**
   - Cookie theft attempts
   - DOM manipulation
   - Form action hijacking

## Best Practices

### ✅ DO
- Luôn sử dụng `SafeText` cho user input
- Sanitize URL trước khi sử dụng trong `href` hoặc `src`
- Sử dụng `sanitizeHtml()` nếu cần HTML formatting
- Test XSS protection định kỳ với attack simulation
- Review CSP policy khi thêm external resources

### ❌ DON'T
- Không sử dụng `dangerouslySetInnerHTML` trực tiếp
- Không trust user input dù đã validate
- Không bypass security functions vì "convenience"
- Không disable CSP trong production
- Không sử dụng `eval()` hoặc `innerHTML` với user input

## Monitoring & Maintenance

### Regular Checks
1. **Weekly:** Chạy attack simulation
2. **Monthly:** Review CSP violations (nếu có)
3. **Quarterly:** Update XSS attack payloads
4. **Annually:** Security audit

### CSP Violation Reporting
CSP violations có thể được report về server để monitoring:
```javascript
// Add CSP report-uri in production
"report-uri /api/csp-report"
```

## Tài liệu tham khảo

- [PortSwigger XSS Prevention](https://portswigger.net/web-security/cross-site-scripting)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

## Kết luận

Hệ thống đã triển khai nhiều lớp bảo vệ XSS:
- ✅ Content-Security-Policy headers
- ✅ HTML escaping
- ✅ URL sanitization
- ✅ HTML sanitization với DOMPurify
- ✅ Security headers
- ✅ Comprehensive testing & attack simulation

Tất cả các cơ chế này hoạt động cùng nhau để tạo ra một hệ thống phòng thủ nhiều lớp, đảm bảo bảo mật cao nhất có thể chống lại các cuộc tấn công XSS.

