import React from 'react';
import { Play, X } from 'lucide-react';
import SmartImage from '@/components/ui/smart-image';
import { Dialog } from '@/components/ui/dialog';
import VideoEmbed, { getVideoThumbnail } from '@/components/gallery/VideoEmbed';
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

// Full-size viewer for a gallery item.
export function MediaLightbox({ item, onClose }) {
  if (!item) return null;
  const isVideo = item.media_type === 'video';
  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <div className="relative z-50 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative aspect-video overflow-hidden bg-gray-950">
          {isVideo ? (
            item.is_external_url ? (
              <VideoEmbed url={item.media_url} title={item.title} />
            ) : (
              <video src={item.media_url} controls autoPlay className="h-full w-full object-contain" />
            )
          ) : (
            <img src={item.media_url} alt={item.title} className="h-full w-full object-contain" />
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {item.category && <span>{categoryLabel(item.category)}</span>}
            {item.category && <span className="text-gray-300">•</span>}
            <span className="text-gray-500">{isVideo ? 'Video' : 'Photo'}</span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{item.title}</h2>
          {item.child_name && (
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                {item.child_name.charAt(0).toUpperCase()}
              </span>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Created by {item.child_name}</p>
                {item.child_age && <p className="text-gray-500">Age {item.child_age}</p>}
              </div>
            </div>
          )}
          {item.description && <p className="mt-4 max-w-3xl leading-relaxed text-gray-600">{item.description}</p>}
        </div>
      </div>
    </Dialog>
  );
}
