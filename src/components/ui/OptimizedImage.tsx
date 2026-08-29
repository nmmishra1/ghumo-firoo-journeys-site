import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fill?: boolean; // when true, image fills container with object-cover
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
  fill = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.setAttribute('fetchpriority', priority ? 'high' : 'auto');
    }
  }, [priority]);

  // Generate WebP and AVIF sources for modern browsers
  const generateModernSources = (originalSrc: string) => {
    if (originalSrc.includes('unsplash.com')) {
      const baseUrl = originalSrc.split('?')[0];
      const params = new URLSearchParams(originalSrc.split('?')[1] || '');
      
      // Define widths for responsive images
      const widths = [640, 768, 1024, 1280, 1536];
      
      const generateSrcSet = (format: string) => {
        return widths
          .map(w => {
            const p = new URLSearchParams(params);
            p.set('fm', format);
            p.set('q', '80');
            p.set('w', w.toString());
            // Remove fixed height to maintain aspect ratio with new width
            p.delete('h');
            return `${baseUrl}?${p.toString()} ${w}w`;
          })
          .join(', ');
      };

      return {
        webp: generateSrcSet('webp'),
        avif: generateSrcSet('avif'),
      };
    }
    return null;
  };

  const safeSrc = encodeURI(src);
  const modernSources = generateModernSources(safeSrc);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Don't render anything if not in view and not priority
  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={cn('bg-gray-200 animate-pulse', fill && 'absolute inset-0 w-full h-full', className)}
        style={{ width: fill ? undefined : width, height: fill ? undefined : height }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  // Remove fade-in classes for priority images to improve LCP
  const imgOpacityClass = priority ? 'opacity-100' : (isLoaded ? 'opacity-100' : 'opacity-0');

  return (
    <div className={cn('relative overflow-hidden', fill && 'absolute inset-0 w-full h-full', className)}>
      {modernSources ? (
        <picture>
          <source srcSet={modernSources.avif} type="image/avif" />
          <source srcSet={modernSources.webp} type="image/webp" />
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              !priority && 'transition-opacity duration-300',
              imgOpacityClass,
              hasError && 'opacity-50'
            )}
            style={{
              width: fill ? '100%' : width,
              height: fill ? '100%' : height,
              objectFit: fill ? 'cover' : undefined,
              backgroundImage: `url(${placeholder})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </picture>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            !priority && 'transition-opacity duration-300',
            imgOpacityClass,
            hasError && 'opacity-50'
          )}
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
            objectFit: fill ? 'cover' : undefined,
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && !priority && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;