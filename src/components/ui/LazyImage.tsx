import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  title,
  className = '',
  placeholder = '/placeholder.svg',
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.setAttribute('fetchpriority', priority ? 'high' : 'auto');
    }
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Convert to WebP if supported, but avoid breaking local/public assets
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return placeholder;
    if (hasError) return placeholder;

    // Check if browser supports WebP
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();

    // Only attempt conversion for external URLs that explicitly end with jpg/png
    // and never for public-root paths (e.g., "/images/foo.png" or "/foo.png").
    const isExternal = /^https?:\/\//i.test(originalSrc);
    const basePath = originalSrc.split('?')[0];
    const isJpgOrPng = /\.(jpe?g|png)$/i.test(basePath);
    const isPublicAsset = originalSrc.startsWith('/') || (!isExternal && !originalSrc.includes('://'));

    if (supportsWebP && isExternal && isJpgOrPng && !isPublicAsset) {
      return basePath.replace(/\.(jpe?g|png)$/i, '.webp');
    }

    return originalSrc;
  };

  const shouldLoad = isInView || priority;
  const imgOpacityClass = priority ? 'opacity-100' : (isLoaded ? 'opacity-100' : 'opacity-0');

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={shouldLoad ? getOptimizedSrc(src) : placeholder}
        alt={alt}
        title={title}
        className={!priority ? `transition-all duration-700 ease-luxury-ease ${imgOpacityClass} ${className}` : `${imgOpacityClass} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      
      {!isLoaded && shouldLoad && !priority && (
        <div className="absolute inset-0 bg-[#0b1026]/5 dark:bg-white/5 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 rounded-full border-2 border-[#C9A25A]/20 border-t-[#C9A25A] animate-spin" />
        </div>
      )}
    </div>
  );
};

export default LazyImage;