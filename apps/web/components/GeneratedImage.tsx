'use client';

import { useState, useCallback } from 'react';
import { getHeritagePlaceholderSvg } from '@/lib/use-generated-image';

interface GeneratedImageProps {
  src?: string | null;
  alt: string;
  culture?: string;
  name?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallback?: 'emoji' | 'svg' | 'none';
  fallbackEmoji?: string;
  onClick?: () => void;
}

/**
 * Universal image component that handles the full fallback chain:
 * 1. Generated/uploaded image URL
 * 2. SVG placeholder with culture colors
 * 3. Emoji fallback
 * 4. Empty state
 */
export function GeneratedImage({
  src,
  alt,
  culture = 'Heritage',
  name = alt,
  className = '',
  width,
  height,
  priority = false,
  fallback = 'svg',
  fallbackEmoji = '🏺',
  onClick,
}: GeneratedImageProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleError = useCallback(() => {
    setImgError(true);
  }, []);

  const handleLoad = useCallback(() => {
    setImgLoaded(true);
  }, []);

  // If we have a valid src and no error yet, show the image
  if (src && !imgError) {
    return (
      <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onError={handleError}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-muted/10 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Fallback: SVG placeholder with culture colors
  if (fallback === 'svg') {
    const svgUrl = getHeritagePlaceholderSvg(name, culture);
    return (
      <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgUrl}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: Emoji
  if (fallback === 'emoji') {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-accent/5 to-transparent ${className}`}
        onClick={onClick}
      >
        <span className="text-4xl md:text-6xl">{fallbackEmoji}</span>
      </div>
    );
  }

  // No fallback
  return null;
}