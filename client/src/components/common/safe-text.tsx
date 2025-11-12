import { escapeHtml, sanitizeUrl } from "@/lib/xss-protection";

interface SafeTextProps {
  children: string | null | undefined;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}

/**
 * SafeText component automatically escapes HTML to prevent XSS attacks
 * Use this component when displaying user input or untrusted content
 */
export function SafeText({
  children,
  as: Component = "span",
  className,
  ...props
}: SafeTextProps) {
  const safeText = escapeHtml(children);

  return (
    <Component className={className} {...props}>
      {safeText}
    </Component>
  );
}

/**
 * SafeAttribute component for sanitizing HTML attributes
 * Use this for attributes like title, alt, aria-label, etc.
 */
export function sanitizeAttribute(value: string | null | undefined): string {
  return escapeHtml(value);
}

/**
 * SafeUrl component for sanitizing URLs to prevent XSSI attacks
 * Use this for href, src, iframe src, etc.
 * @param url - URL to sanitize
 * @param allowedDomains - Optional array of allowed domains
 * @param strict - If true, only allow whitelisted domains. If false, allow any domain (for images)
 * @returns Sanitized URL or empty string if invalid
 */
export function safeUrl(
  url: string | null | undefined,
  allowedDomains?: string[],
  strict: boolean = true
): string {
  return sanitizeUrl(url, allowedDomains, strict);
}
