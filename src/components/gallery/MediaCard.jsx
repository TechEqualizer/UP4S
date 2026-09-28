import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import SmartImage from '@/components/ui/smart-image';
import { Dialog } from '@/components/ui/dialog';
import VideoEmbed, { getVideoThumbnail, THUMBNAIL_MIN_WIDTH } from '@/components/gallery/VideoEmbed';
import { cn } from '@/lib/utils';

export const CATEGORY_LABELS = {
  'wishes-granted': 'Wishes',
  events: 'Events',
  'behind-scenes': 'Behind the Scenes',
};

export function categoryLabel(value) {
  if (!value) return '';
  return CATEGORY_LABELS[value] ?? value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getDisplayImage(item) {
  if (item.is_external_url && item.media_type === 'video') {
    return getVideoThumbnail(item.media_url)?.thumbnail || item.media_url;
  }
  return item.media_url;
}

function byline(item) {
  if (!item.child_name) return null;
  return `By ${item.child_name}${item.child_age ? `, age ${item.child_age}` : ''}`;
}

// Equal-height gallery tile: fixed-ratio media on top, one title line and one meta line below.
export function MediaCard({ item, onOpen, className, style, showCategory = true }) {
  const isVideo = item.media_type === 'video';
  const meta = [showCategory && categoryLabel(item.category), byline(item)].filter(Boolean).join(' · ');
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`${isVideo ? 'Play' : 'View'}: ${item.title}`}
      style={style}
      className={cn(
        'group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-left',
        'shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow duration-300 hover:shadow-xl hover:shadow-gray-900/[0.06]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <SmartImage
          src={getDisplayImage(item)}
          fallbackSrc={item.is_external_url && isVideo ? getVideoThumbnail(item.media_url)?.fallback : undefined}
          minNaturalWidth={item.is_external_url && isVideo ? THUMBNAIL_MIN_WIDTH : 0}
          alt=""
          placeholderIcon={isVideo ? 'video' : 'image'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {isVideo && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg ring-1 ring-black/5 backdrop-blur transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-gray-900 text-gray-900" aria-hidden="true" />
            </span>
          </div>
        )}
        {isVideo && (
          <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            <Play className="h-3 w-3 fill-current" aria-hidden="true" /> Watch
          </span>
        )}
      </div>
      <div className="flex min-h-[4.5rem] flex-col justify-center px-4 py-3.5">
        <h3 className="truncate font-semibold text-gray-900 transition-colors group-hover:text-blue-700" title={item.title}>
          {item.title}
        </h3>
        {meta && <p className="mt-0.5 truncate text-sm text-gray-500">{meta}</p>}
      </div>
    </button>
  );
}

// Full-screen, cinema-style viewer for a gallery item. The media is sized to fit the
// viewport (16:9 for video), with the close button and title above it so nothing
// covers the player's own controls.
export function MediaLightbox({ item, onClose }) {
  if (!item) return null;
  // Keyed so each item starts fresh (player loading state, "Read more").
  return <Viewer key={item.id} item={item} onClose={onClose} />;
}

function Viewer({ item, onClose }) {
  const [showMore, setShowMore] = useState(false);
  const isVideo = item.media_type === 'video';
  const meta = [categoryLabel(item.category), isVideo ? 'Video' : 'Photo'].filter(Boolean).join(' · ');
  const longDescription = (item.description || '').length > 180;

  return (
    <Dialog
      open={!!item}
      onOpenChange={onClose}
      aria-label={item.title}
      className="p-0 sm:p-6"
      overlayClassName="bg-gray-950/95 backdrop-blur-sm"
    >
      <div className="relative z-50 flex max-h-full w-full flex-col overflow-y-auto">
        <div
          className="mx-auto w-full"
          // Largest 16:9 box that fits under the title bar; the caption scrolls below it.
          style={{ maxWidth: 'min(72rem, calc((100svh - 7rem) * 16 / 9))', minWidth: 'min(100vw, 20rem)' }}
        >
          <div className="flex items-center justify-between gap-4 px-4 pb-3 pt-4 text-white sm:px-0 sm:pt-0">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">{meta}</p>
              <h2 className="mt-1 truncate font-display text-lg font-bold tracking-tight sm:text-xl" title={item.title}>{item.title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {isVideo ? (
            <div className="relative aspect-video w-full overflow-hidden bg-black shadow-2xl sm:rounded-xl">
              <VideoEmbed url={item.media_url} title={item.title} />
            </div>
          ) : (
            <img
              src={item.media_url}
              alt={item.title}
              className="mx-auto max-h-[calc(100svh-7rem)] w-auto max-w-full object-contain sm:rounded-xl"
            />
          )}

          {(item.child_name || item.description) && (
            <div className="px-4 pb-6 pt-4 text-sm text-gray-300 sm:px-0">
              {item.child_name && (
                <p className="font-medium text-white">
                  Created by {item.child_name}{item.child_age ? `, age ${item.child_age}` : ''}
                </p>
              )}
              {item.description && (
                <p className={`mt-1 max-w-3xl leading-relaxed ${longDescription && !showMore ? 'line-clamp-2' : ''}`}>
                  {item.description}
                </p>
              )}
              {longDescription && (
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="mt-1 rounded font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {showMore ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
