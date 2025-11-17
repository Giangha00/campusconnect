import DOMPurify from 'dompurify';

/**
 * Whitelist of allowed domains for external resources (iframe, links)
 * Add trusted domains here to prevent XSSI attacks
 * Note: Images are allowed from any domain (they cannot execute JavaScript)
 */
const ALLOWED_DOMAINS = [
  'google.com',
  'googleapis.com',
  'gstatic.com',
  'maps.google.com',
  'www.google.com',
  'images.unsplash.com',
  'unsplash.com',
  'facebook.com',
  'www.facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'www.instagram.com',
  'linkedin.com',
  'www.linkedin.com',
  'aptech.fpt.edu.vn',
  // Add more trusted domains as needed
];

/**
 * Check if a URL is safe (not a javascript: or data: URL)
 * Enhanced with more attack vectors based on PortSwigger XSS prevention guide
 * @param url - URL to validate
 * @returns true if URL is safe, false otherwise
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Normalize URL for checking (remove whitespace, decode entities)
  const normalizedUrl = url.trim().toLowerCase();
  
  // Block dangerous protocols to prevent XSSI
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
    'onerror:',
    'onload:',
    'onclick:',
  ];
  
  for (const protocol of dangerousProtocols) {
    if (normalizedUrl.startsWith(protocol)) {
      return false;
    }
  }
  
  // Block encoded javascript: URLs (e.g., %6A%61%76%61%73%63%72%69%70%74:)
  try {
    const decodedUrl = decodeURIComponent(normalizedUrl);
    if (decodedUrl.startsWith('javascript:') || decodedUrl.startsWith('data:')) {
      return false;
    }
  } catch {
    // If decoding fails, continue with original check
  }
  
  // Block URLs with script injection patterns
  const scriptPatterns = [
    /javascript\s*:/i,
    /data\s*:\s*text\/html/i,
    /data\s*:\s*image\/svg\+xml/i,
    /on\w+\s*=/i, // Event handlers like onclick=, onerror=, etc.
  ];
  
  for (const pattern of scriptPatterns) {
    if (pattern.test(normalizedUrl)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate and sanitize URL to prevent XSSI attacks
 * @param url - URL to validate
 * @param allowedDomains - Optional array of allowed domains (defaults to ALLOWED_DOMAINS)
 * @param strict - If true, only allow whitelisted domains. If false, allow any domain for images/resources
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  url: string | null | undefined,
  allowedDomains: string[] = ALLOWED_DOMAINS,
  strict: boolean = true
): string {
  if (!url) return '';
  
  // First check if it's a safe URL (not javascript: or data:)
  if (!isSafeUrl(url)) {
    return '';
  }
  
  try {
    // For relative URLs, allow them
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return url;
    }
    
    // For absolute URLs, validate the domain
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // If not strict mode (for images), allow any http/https URL
    if (!strict) {
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return urlObj.toString();
      }
      return '';
    }
    
    // In strict mode, check if domain is in whitelist
    const isAllowed = allowedDomains.some(domain => {
      const domainLower = domain.toLowerCase();
      return hostname === domainLower || hostname.endsWith('.' + domainLower);
    });
    
    if (!isAllowed) {
      console.warn(`Blocked URL from untrusted domain: ${hostname}`);
      return '';
    }
    
    // Return sanitized URL (only http/https protocols)
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return urlObj.toString();
    }
    
    return '';
  } catch (error) {
    // Invalid URL format
    console.warn(`Invalid URL format: ${url}`);
    return '';
  }
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Enhanced configuration based on PortSwigger XSS prevention best practices
 * Use this when you need to allow some HTML tags but remove dangerous ones
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return escaped HTML
    return escapeHtml(html);
  }
  
  // Enhanced DOMPurify configuration with stricter rules
  return DOMPurify.sanitize(html, {
    // Only allow safe, formatting tags
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    // Only allow safe attributes
    ALLOWED_ATTR: ['href', 'target', 'class'],
    // Strict URL validation - block javascript:, data:, and other dangerous protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Remove dangerous attributes
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // Remove dangerous tags
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    // Return DOM nodes instead of string for better security
    RETURN_DOM: false,
    // Keep relative URLs
    KEEP_CONTENT: true,
  });
}

/**
 * Escape HTML special characters to prevent XSS attacks
 * Use this for plain text that should be displayed as-is
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize user input for display
 * This is a convenience function that escapes HTML by default
 * @param input - User input to sanitize
 * @returns Sanitized string safe for display
 */
export function sanitizeUserInput(input: string | null | undefined): string {
  return escapeHtml(input);
}

/**
 * Sanitize object properties that contain user input
 * @param obj - Object with potentially unsafe properties
 * @param properties - Array of property names to sanitize
 * @returns New object with sanitized properties
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  properties: (keyof T)[]
): T {
  const sanitized = { ...obj };
  properties.forEach((prop) => {
    if (typeof sanitized[prop] === 'string') {
      sanitized[prop] = escapeHtml(sanitized[prop] as string) as T[keyof T];
    }
  });
  return sanitized;
}

