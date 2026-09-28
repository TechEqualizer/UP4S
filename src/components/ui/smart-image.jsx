import React, { useEffect, useState } from 'react';
import { ImageOff, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// <img> that tries `fallbackSrc` if `src` fails, then shows a tidy placeholder
// instead of the browser's broken-image icon and alt text.
export default function SmartImage({ src, fallbackSrc, alt, className, placeholderIcon = 'image', minNaturalWidth = 0, ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(!src);
  }, [src]);

  function tryFallback() {
    if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
    else setFailed(true);
  }

  if (failed) {
    const Icon = placeholderIcon === 'video' ? Play : ImageOff;
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400', className)}
      >
        <Icon className="w-10 h-10" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('bg-gray-100', className)}
      onError={tryFallback}
      onLoad={(e) => {
        // Some hosts answer a missing image with a tiny placeholder instead of an error.
        if (minNaturalWidth && e.currentTarget.naturalWidth < minNaturalWidth) tryFallback();
      }}
      {...props}
    />
  );
}
