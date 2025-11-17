import { useState, useRef, useEffect } from "react";
import { safeUrl, sanitizeAttribute } from "@/components/common/safe-text";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * OptimizedImage component với lazy loading nâng cao và Intersection Observer
 * Giúp tối ưu hiệu năng load ảnh
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  fallback = "/images/schools/School_1.jpg",
  width,
  height,
  quality = 80,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sanitizedSrc = safeUrl(src, undefined, false) || fallback;
    
    // Intersection Observer cho lazy loading nâng cao
    if (imgRef.current && "IntersectionObserver" in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Chỉ load khi image vào viewport
              const img = new Image();
              img.onload = () => {
                setImageSrc(sanitizedSrc);
                setIsLoading(false);
              };
              img.onerror = () => {
                setImageSrc(fallback);
                setHasError(true);
                setIsLoading(false);
              };
              img.src = sanitizedSrc;
              
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current);
              }
            }
          });
        },
        { rootMargin: "50px" } // Load trước 50px khi vào viewport
      );
      
      observerRef.current.observe(imgRef.current);
    } else {
      // Fallback cho browser không hỗ trợ IntersectionObserver
      const img = new Image();
      img.onload = () => {
        setImageSrc(sanitizedSrc);
        setIsLoading(false);
      };
      img.onerror = () => {
        setImageSrc(fallback);
        setHasError(true);
        setIsLoading(false);
      };
      img.src = sanitizedSrc;
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src, fallback]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={sanitizeAttribute(alt)}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallback) {
            target.src = fallback;
            setHasError(true);
          }
        }}
        style={{
          objectFit: "contain",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

