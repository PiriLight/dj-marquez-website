import { useEffect, useRef, useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import { useEvents } from '../hooks/useEvents.js';
import { displayEventDate } from '../utils/events.js';

/** True once `ref` is within `rootMargin` of the viewport. Fires once, then stops. */
function useNearViewport(ref, rootMargin) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return near;
}

/**
 * Tracks whether `ref` is genuinely on screen (>= ~15% of it visible). Unlike
 * useNearViewport this keeps reporting, so playback can follow the section in
 * and out of view. `isIntersecting` alone would flip true at a single pixel,
 * so the ratio is checked explicitly.
 */
function useInViewport(ref) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setInView(entry.isIntersecting && entry.intersectionRatio >= 0.14);
        });
      },
      { threshold: [0, 0.15] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

/** Mirrors the CSS `prefers-reduced-motion` query so JS can skip motion too. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

/**
 * Decorative live-visual backdrop for the Agenda. Mounted only once the section
 * is near the viewport, so the clip never touches initial page load.
 *
 * The scrim stack is tuned against the footage rather than by eye: every text
 * element here sits over the video, and two of them start with almost no
 * headroom on the plain background — the 12px amber eyebrow (6.9:1) and the
 * 50%-opacity city line (4.8:1). These alphas keep both at/above WCAG AA 4.5:1
 * across the whole clip, including its near-white flash around t=28s, which is
 * what caps how far the footage can be brought up. Peaks still reach ~5x the
 * #0b0a09 base, so the fire reads as moving light rather than a lit rectangle.
 */
function AgendaBackdrop({ active }) {
  const videoRef = useRef(null);
  const hasStarted = useRef(false);
  const [live, setLive] = useState(false);

  // Preload and playback are deliberately separate. This component mounts (and
  // so starts buffering) while the section is still ~600px away, but there is
  // no `autoplay` attribute and nothing calls play() until `active` — so the
  // timeline genuinely sits at 0 no matter how long the visitor lingers on the
  // hero. useAutoplayVideo is intentionally not used here: it plays on mount,
  // which is exactly the preload-equals-playback behaviour we need to avoid.
  // The hero keeps using it, untouched.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;

    if (!active) {
      // Buffering, or the visitor has scrolled away again. Never rewind here:
      // only the first real entry starts from the top.
      if (!v.paused) v.pause();
      return undefined;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      // Belt-and-braces: nothing has played yet, so this is already 0 unless a
      // browser restored a scroll position mid-clip.
      try {
        v.currentTime = 0;
      } catch (err) {
        /* seeking before metadata is safe to ignore — the clip is still at 0 */
      }
    }

    const played = v.play();
    if (played && played.catch) {
      played.catch(() => {
        // Muted inline playback is normally allowed; if a browser still blocks
        // it, retry once on the next interaction rather than leaving it dark.
        const retry = () => {
          v.muted = true;
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        };
        window.addEventListener('pointerdown', retry, { once: true, passive: true });
        window.addEventListener('keydown', retry, { once: true });
      });
    }
    return undefined;
  }, [active]);

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <video
        ref={videoRef}
        className={live ? 'm4rqx-agenda-video is-live' : 'm4rqx-agenda-video'}
        src="/assets/videos/animacao-12.mp4"
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
        // Fades in on the first frame that actually renders, so the entrance
        // coincides with playback starting rather than with buffering finishing.
        onPlaying={() => setLive(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* Flat scrim — main readability guard against the clip's fire highlights.
          0.54 desktop / 0.58 mobile (see the mobile override below) — roughly
          15-20% lighter than the previous 0.63/0.72 pair, so the footage reads
          more clearly without competing with the event list. */}
      <div className="m4rqx-agenda-scrim" style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,8,0.54)' }} />

      {/* Vertical fade: solid at both edges so the clip dissolves into the page
          background (no hard video rectangle into Archive above / Booking below),
          lightest across the header band, and heavier from 50% down where the
          event rows sit. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, #0b0a09 0%, rgba(11,10,9,0.44) 8%, rgba(11,10,9,0.3) 20%, rgba(11,10,9,0.4) 36%, rgba(11,10,9,0.52) 50%, rgba(11,10,9,0.52) 90%, rgba(11,10,9,0.93) 97%, #0b0a09 100%)',
        }}
      />

      {/* Side vignette. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(11,10,9,0.58) 0%, rgba(11,10,9,0) 24%, rgba(11,10,9,0) 76%, rgba(11,10,9,0.58) 100%)',
        }}
      />

      {/* Soft pool of extra darkness under the event list — no hard-edged boxes. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(130% 60% at 50% 65%, rgba(5,5,8,0.34) 0%, rgba(5,5,8,0.16) 46%, rgba(5,5,8,0) 78%)',
        }}
      />
    </div>
  );
}

export default function Events({ feedOptions } = {}) {
  const sectionRef = useRef(null);
  const near = useNearViewport(sectionRef, '600px 0px'); // load
  const inView = useInViewport(sectionRef); // play
  const reducedMotion = usePrefersReducedMotion();
  const { events, isLoading, source, today } = useEvents(feedOptions);

  return (
    <section
      id="eventos"
      ref={sectionRef}
      aria-labelledby="eventos-title"
      style={{ position: 'relative', isolation: 'isolate', background: '#0b0a09', padding: 'clamp(56px,9vh,110px) clamp(20px,6vw,88px)' }}
    >
      {near && !reducedMotion && <AgendaBackdrop active={inView} />}

      <Reveal
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1320,
          margin: '0 auto clamp(26px,4vh,44px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#cf8a3f' }}>
            Agenda
          </p>
          <h2
            id="eventos-title"
            style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 'clamp(32px,4.6vw,66px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#f5f0e8' }}
          >
            Próximos Eventos
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)' }}>{today.slice(0, 4)}</p>
      </Reveal>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1320, margin: '0 auto', borderTop: '1px solid rgba(245,240,232,0.12)' }}>
        {(source === 'fallback' || source === 'unconfigured') && <p className="m4rqx-events-notice" role="status">A agenda está temporariamente indisponível. Confirma as próximas datas nas redes do artista.</p>}
        {isLoading && events.length === 0 ? (
          <p className="m4rqx-events-state" role="status">A carregar agenda…</p>
        ) : events.length === 0 && source === 'remote' ? (
          <p className="m4rqx-events-state">Sem datas anunciadas de momento.</p>
        ) : events.map((ev) => (
          <Reveal
            key={ev.id}
            className="m4rqx-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(120px,0.5fr) minmax(0,1.4fr) minmax(0,1fr) auto',
              alignItems: 'center',
              gap: 'clamp(16px,3vw,40px)',
              padding: 'clamp(22px,3vh,34px) clamp(8px,1.6vw,24px)',
              borderBottom: '1px solid rgba(245,240,232,0.12)',
            }}
          >
            <span className="m4rqx-row-date" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 'clamp(16px,1.5vw,21px)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.9)', transition: 'color 0.3s ease' }}>
              <time dateTime={ev.date}>{displayEventDate(ev.date)}</time>
            </span>
            <span className="m4rqx-row-venue" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 'clamp(20px,2.4vw,34px)', letterSpacing: '0.01em', color: '#f5f0e8', display: 'inline-block', transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
              {ev.name}
            </span>
            <span style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>
              {ev.location}
            </span>

            {ev.info_url ? (
              <a
                href={ev.info_url}
                target="_blank"
                rel="noopener noreferrer"
                className="m4rqx-info-btn"
                aria-label={`Mais informações sobre ${ev.name}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '12px 0',
                  margin: '-12px 0',
                  border: 'none',
                  borderBottom: '1px solid rgba(245,240,232,0.32)',
                  background: 'transparent',
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,0.82)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'color 0.25s ease, border-color 0.25s ease',
                }}
              >
                Mais informações
                <span className="m4rqx-arrow" aria-hidden="true" style={{ display: 'inline-block', transition: 'transform 0.25s ease' }}>
                  →
                </span>
              </a>
            ) : <span aria-hidden="true" />}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
