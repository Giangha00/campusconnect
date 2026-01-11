interface SafeTextProps {
  children: string | null | undefined;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}

/**
 * Simple text component
 */
export function SafeText({
  children,
  as: Component = "span",
  className,
  ...props
}: SafeTextProps) {
  return (
    <Component className={className} {...props}>
      {children || ""}
    </Component>
  );
}

/**
 * Simple attribute sanitizer - returns value as is
 */
export function sanitizeAttribute(value: string | null | undefined): string {
  return value || "";
}

/**
 * Simple URL validator
 * @param url - URL to validate
 * @param allowedDomains - Ignored (kept for compatibility)
 * @param strict - Ignored (kept for compatibility)
 */
export function safeUrl(
  url: string | null | undefined,
  allowedDomains?: string[],
  strict?: boolean
): string {
  return url || "";
}
