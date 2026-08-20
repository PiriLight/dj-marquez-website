import { useCallback, useEffect, useRef } from 'react';

const MIN_DURATION = 700;
const MAX_DURATION = 1100;
const PRESS_MS = 200;

/** Symmetric ease — slow start, quick middle, soft landing. */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Click handler for in-page anchors: replaces the browser's instant jump with a
 * short animated travel, plus a brief press response on the button itself.
 *
 * Deliberately not scroll-jacking — the animation aborts the moment the visitor
 * touches the wheel, a key or the screen, so normal scrolling always wins. Under
 * prefers-reduced-motion nothing is intercepted at all and the native anchor
 * jump happens as before.
 */
export function useSmoothScroll() {
  const frameRef = useRef(0);
  const cleanupRef = useRef(null);

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
      if (cleanupRef.current) cleanupRef.current();
    },
    []
  );

  return useCallback((event) => {
    const el = event.currentTarget;
    const href = el.getAttribute('href');
    if (!href || href.length < 2 || href.charAt(0) !== '#') return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    // Reduced motion: let the browser do its own instant jump.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    event.preventDefault();

    // Short press feedback on the button (CSS handles the actual transform).
    el.classList.add('is-pressed');
    window.setTimeout(() => el.classList.remove('is-pressed'), PRESS_MS);

    const startY = window.scrollY;
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    // No fixed/sticky chrome on this site, so the section top is the target.
    const endY = Math.max(0, Math.min(maxY, startY + target.getBoundingClientRect().top));
    const distance = endY - startY;
    if (Math.abs(distance) < 2) return;

    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.abs(distance) * 0.5));
    const startTime = performance.now();

    cancelAnimationFrame(frameRef.current);
    if (cleanupRef.current) cleanupRef.current();

    let cancelled = false;
    let settled = false;
    const abort = () => {
      cancelled = true;
    };
    const events = ['wheel', 'touchstart', 'keydown'];
    events.forEach((name) => window.addEventListener(name, abort, { passive: true }));

    let safetyTimer = 0;
    const cleanup = () => {
      window.clearTimeout(safetyTimer);
      events.forEach((name) => window.removeEventListener(name, abort));
      cleanupRef.current = null;
    };
    cleanupRef.current = cleanup;

    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      // Keep the URL in step without triggering a second jump.
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', href);
      }
    };

    // If frames never arrive — background tab, starved renderer — the click must
    // still take the visitor to the section rather than doing nothing, since the
    // default anchor jump was already prevented.
    safetyTimer = window.setTimeout(() => {
      if (settled || cancelled) return;
      cancelAnimationFrame(frameRef.current);
      window.scrollTo(0, endY);
      finish();
    }, duration + 250);

    const step = (now) => {
      if (cancelled || settled) {
        cleanup();
        return;
      }
      const progress = Math.min(1, (now - startTime) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      finish();
    };

    frameRef.current = requestAnimationFrame(step);
  }, []);
}
