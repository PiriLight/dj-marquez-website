import { useEffect, useRef, useState } from 'react';

export function useAutoplayVideo(videoRef) {
  const [state, setState] = useState('loading');
  const startRef = useRef(() => {});
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = true;
    let visible = true;
    let userRequested = false;
    let timer;
    video.muted = video.defaultMuted = true;
    video.playsInline = true;
    const allowed = () => visible && !document.hidden && (!motion.matches || userRequested);
    const start = async (manual = false) => {
      if (manual) userRequested = true;
      if (!allowed()) { video.pause(); return; }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (active && (video.paused || video.readyState < 3)) setState('blocked'); }, 8000);
      try { await video.play(); if (active && !video.paused) setState('playing'); }
      catch (error) { if (active && error.name !== 'AbortError') setState(video.error ? 'failed' : 'blocked'); }
    };
    const playing = () => { window.clearTimeout(timer); if (active) setState('playing'); };
    const failed = () => { window.clearTimeout(timer); if (active) setState('failed'); };
    const paused = () => { if (active && allowed()) setState('blocked'); };
    const sync = () => {
      if (allowed()) start();
      else { window.clearTimeout(timer); video.pause(); if (motion.matches && !userRequested) setState('blocked'); }
    };
    const preferenceChanged = () => { userRequested = false; sync(); };
    startRef.current = () => start(true);
    video.addEventListener('playing', playing);
    video.addEventListener('error', failed, true);
    video.addEventListener('pause', paused);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', preferenceChanged);
    const observer = new IntersectionObserver(([entry]) => {
      const nextVisible = entry.isIntersecting;
      if (nextVisible !== visible) { visible = nextVisible; sync(); }
    });
    observer.observe(video);
    // Respect reduced motion; do not retry on scroll or every pause.
    video.autoplay = !motion.matches;
    sync();
    return () => {
      active = false;
      window.clearTimeout(timer);
      observer.disconnect();
      video.removeEventListener('playing', playing);
      video.removeEventListener('error', failed, true);
      video.removeEventListener('pause', paused);
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', preferenceChanged);
      video.pause();
      startRef.current = () => {};
    };
  }, [videoRef]);
  return { state, start: () => startRef.current() };
}
