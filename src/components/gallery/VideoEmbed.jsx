import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const YOUTUBE_ID = /(?:youtube(?:-nocookie)?\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/;

export function parseVideoUrl(url = '') {
  const youtube = String(url).match(YOUTUBE_ID);
  if (youtube) return { provider: 'youtube', id: youtube[1] };
  const vimeo = String(url).match(VIMEO_ID);
  if (vimeo) return { provider: 'vimeo', id: vimeo[1] };
  return { provider: 'file' };
}

// maxresdefault is the sharpest frame but doesn't exist for every upload (YouTube then
// serves a 120×90 grey placeholder, which SmartImage's `minNaturalWidth` rejects).
// mqdefault always exists and is 16:9, so it has no letterbox bars.
export const THUMBNAIL_MIN_WIDTH = 121;

export const getVideoThumbnail = (url) => {
  const video = parseVideoUrl(url);
  if (video.provider === 'youtube') {
    return {
      thumbnail: `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
      fallback: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`,
    };
  }
  // Vimeo thumbnails need an API call; show the placeholder instead.
  return { thumbnail: url, fallback: url };
};

// Plays a gallery video: YouTube/Vimeo in an iframe, anything else in <video>.
// Shows a spinner until the player has loaded.
export default function VideoEmbed({ url, title }) {
  const [loaded, setLoaded] = useState(false);
  const video = parseVideoUrl(url);

  let player;
  if (video.provider === 'youtube') {
    const params = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0', modestbranding: '1' });
    player = (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.id}?${params}`}
        title={title}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        // YouTube refuses embeds that send no referrer ("Error 153").
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  } else if (video.provider === 'vimeo') {
    player = (
      <iframe
        src={`https://player.vimeo.com/video/${video.id}?autoplay=1&playsinline=1&dnt=1`}
        title={title}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  } else {
    player = (
      <video
        src={url}
        title={title}
        onLoadedData={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full object-contain"
        controls
        autoPlay
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <>
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" role="status" aria-label="Loading video">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" aria-hidden="true" />
        </div>
      )}
      {player}
    </>
  );
}
