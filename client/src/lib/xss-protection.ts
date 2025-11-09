import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this when you need to allow some HTML tags but remove dangerous ones
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return escaped HTML
    return escapeHtml(html);
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
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

