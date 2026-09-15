const env = import.meta.env;

const configuredBookingUrl = env.VITE_BOOKING_URL?.trim();
const configuredVideoId = env.VITE_YOUTUBE_VIDEO_ID?.trim();
const configuredVideoTitle = env.VITE_YOUTUBE_VIDEO_TITLE?.trim();

export const SITE_LINKS = Object.freeze({
  instagram: 'https://www.instagram.com/m4rquezdj/',
  youtube: 'https://www.youtube.com/@m4rquezdj',
  youtubeChannelId: 'UCOhHTtoIrGATjgy-e6MkHfQ',
  archive: 'https://drive.google.com/drive/folders/1scMaYX1ndwSJr70NbltrbYxjo6V7aCFd?usp=sharing',
  booking: configuredBookingUrl || '#booking',
});

export const YOUTUBE_CONTENT = Object.freeze({
  videoId: configuredVideoId || '5Jwva63JP8g',
  title: configuredVideoTitle || 'M4rquez-Ramboya',
});

export const HERO_MEDIA = Object.freeze({
  video: '/assets/videos/hero-video.optimized.mp4',
  poster: '/assets/images/hero-poster.webp',
});
