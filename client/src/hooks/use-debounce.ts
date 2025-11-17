import { useState, useEffect } from "react";

/**
 * Hook để debounce giá trị
 * Giúp giảm số lần re-render và filter không cần thiết khi user đang gõ
 * 
 * @param value - Giá trị cần debounce
 * @param delay - Thời gian delay (ms), mặc định 300ms
 * @returns Giá trị đã được debounce
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState("");
 * const debouncedSearchQuery = useDebounce(searchQuery, 300);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

