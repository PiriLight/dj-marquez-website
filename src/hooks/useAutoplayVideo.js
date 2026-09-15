import { useEffect } from 'react';

/**
 * Keeps the hero video silently autoplaying across browsers that block or
 * pause muted background video, retrying on the first user interaction.
 */
export function useAutoplayVideo(videoRef) {
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    v.playsInline = true;
    v.loop = true;

    const shouldPlay = () => !motionQuery.matches && !document.hidden;
    const tryPlay = () => {
      if (!shouldPlay()) {
        v.pause();
        return;
      }
      v.muted = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    tryPlay();

    const onVolumeChange = () => {
      if (!v.muted) v.muted = true;
    };
    const onPause = () => {
      if (shouldPlay()) tryPlay();
    };
    const syncPlayback = () => tryPlay();

    v.addEventListener('ended', tryPlay);
    v.addEventListener('volumechange', onVolumeChange);
    v.addEventListener('pause', onPause);
    document.addEventListener('visibilitychange', syncPlayback);
    motionQuery.addEventListener('change', syncPlayback);

    const retryEvents = ['click', 'touchstart', 'scroll', 'keydown'];
    const retryPlay = () => {
      tryPlay();
      retryEvents.forEach((evt) => window.removeEventListener(evt, retryPlay));
    };
    retryEvents.forEach((evt) => window.addEventListener(evt, retryPlay, { passive: true, once: true }));

    return () => {
      v.removeEventListener('ended', tryPlay);
      v.removeEventListener('volumechange', onVolumeChange);
      v.removeEventListener('pause', onPause);
      document.removeEventListener('visibilitychange', syncPlayback);
      motionQuery.removeEventListener('change', syncPlayback);
      retryEvents.forEach((evt) => window.removeEventListener(evt, retryPlay));
    };
  }, [videoRef]);
}
