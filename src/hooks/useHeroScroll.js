import { useEffect, useState } from 'react';

/**
 * Tracks page scroll progress over the hero's pin zone and derives the
 * overlay/content/video transitions used while the hero un-pins.
 */
export function useHeroScroll(overlayIntensity = 0.42) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const zone = window.innerHeight * 1.3;
      const next = Math.min(1, Math.max(0, window.scrollY / zone));
      setProgress(next);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fadeProgress = Math.min(1, progress / 0.3);
  const lateProgress = Math.max(0, Math.min(1, (progress - 0.6) / 0.4));

  return {
    overlayColor: `rgba(10,9,8,${Math.min(0.94, overlayIntensity + lateProgress * 0.5)})`,
    contentOpacity: 1 - fadeProgress,
    contentTransform: `translateY(${-fadeProgress * 30}px)`,
    videoOpacity: 1 - lateProgress,
  };
}
