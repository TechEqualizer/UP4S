import React from 'react';

export const getVideoThumbnail = (url) => {
  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      fallback: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }
  
  // Vimeo URL patterns
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch) {
    // For Vimeo, we'd need to make an API call to get thumbnail
    // For now, return a placeholder
    return {
      thumbnail: url,
      fallback: url
    };
  }
  
  return {
    thumbnail: url,
    fallback: url
  };
};

export default function VideoEmbed({ url, title }) {
  // YouTube embed
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  
  // Vimeo embed
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return (
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  
  // Fallback for other video URLs
  return (
    <video
      src={url}
      title={title}
      className="w-full h-full object-contain"
      controls
      autoPlay
    />
  );
}