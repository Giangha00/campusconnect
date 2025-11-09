import { escapeHtml } from "@/lib/xss-protection";

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
