import { useRef } from 'react';
import { useHeroScroll } from '../hooks/useHeroScroll.js';
import { useAutoplayVideo } from '../hooks/useAutoplayVideo.js';
import { useSmoothScroll } from '../hooks/useSmoothScroll.js';
import SocialLinks from '../components/SocialLinks.jsx';
import { CalendarIcon } from '../components/Icons.jsx';

const OVERLAY_INTENSITY = 0.42;

export default function Hero() {
  const videoRef = useRef(null);
  useAutoplayVideo(videoRef);
  const { overlayColor, contentOpacity, contentTransform, videoOpacity } = useHeroScroll(OVERLAY_INTENSITY);
  const smoothScroll = useSmoothScroll();

  return (
    <div style={{ position: 'relative' }}>
      <section
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100svh',
          overflow: 'hidden',
          background: '#0b0a09',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <video
          ref={videoRef}
          className="m4rq-anim"
          src="/assets/videos/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 32%',
            animation: 'm4rqZoom 22s ease-in-out infinite alternate',
            willChange: 'transform',
            opacity: videoOpacity,
          }}
        />

        <div style={{ position: 'absolute', inset: 0, background: overlayColor }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(11,10,9,0.15) 0%, rgba(11,10,9,0.05) 35%, rgba(11,10,9,0.55) 78%, rgba(11,10,9,0.88) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 min(18vw,220px) rgba(0,0,0,0.55)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, height: '100%', opacity: contentOpacity, transform: contentTransform }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              display: 'flex',
              justifyContent: 'center',
              padding: '0 6vw',
            }}
          >
            <img
              className="m4rq-anim"
              src="/assets/images/logo-m4rquez.png"
              alt="DJ M4rquez"
              style={{
                width: 'min(78vw,360px)',
                maxWidth: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))',
                animation: 'm4rqFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both',
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              top: 'calc(50% + min(26vw,120px))',
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateY(-7vh)',
            }}
          >
            <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <a
                  href="#eventos"
                  onClick={smoothScroll}
                  className="m4rq-anim m4rq-cta"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '14px 30px',
                    background: 'rgba(24,18,14,0.35)',
                    backdropFilter: 'blur(10px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(160%)',
                    color: '#f5f0e8',
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    borderRadius: 12,
                    border: '1px solid rgba(207,138,63,0.5)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
                    transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
                    animation: 'm4rqFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.5s both',
                  }}
                >
                  <span>Próximos Eventos</span>
                  <span className="m4rq-arrow" style={{ display: 'inline-block', transition: 'transform 0.25s ease' }}>
                    →
                  </span>
                </a>
                <a
                  href="#booking"
                  onClick={smoothScroll}
                  className="m4rq-anim m4rq-booking-cta"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 9,
                    padding: '13px 26px',
                    background: 'transparent',
                    color: 'rgba(245,240,232,0.85)',
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 500,
                    fontSize: 13,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    borderRadius: 12,
                    border: '1px solid rgba(207,138,63,0.4)',
                    transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
                    animation: 'm4rqFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s both',
                  }}
                >
                  <CalendarIcon />
                  <span>Agendar Artista</span>
                </a>
              </div>
            </div>

            <div
              style={{
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'clamp(16px,2.5vh,24px)',
                textAlign: 'center',
                padding: '0 6vw clamp(28px,5vh,44px)',
              }}
            >
              <SocialLinks size="large" />
            </div>
          </div>

          <div
            className="m4rq-anim"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 'clamp(16px,3vh,28px)',
              transform: 'translateX(-50%)',
              width: 1,
              height: 26,
              background: 'linear-gradient(to bottom, rgba(245,240,232,0.6), rgba(245,240,232,0))',
              animation: 'm4rqBounce 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </section>
      <div style={{ height: '130vh' }} />
    </div>
  );
}
