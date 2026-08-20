import { useEffect, useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import Lightbox from '../components/Lightbox.jsx';

/**
 * Live moments mosaic.
 * To swap media later, edit only src / alt / objectPosition below — every tile
 * crops with object-fit: cover inside a fixed grid cell, so replacing a photo
 * or video never changes the layout.
 */
const MEDIA = [
  {
    id: 'lead',
    src: '/images/gallery-4.webp',
    alt: 'DJ M4rquez na cabine durante um set ao vivo',
    position: 'center center',
    caption: { title: 'Main Room', meta: 'Lisboa, Portugal' },
    area: { gridColumn: '1 / span 7', gridRow: '1 / span 3' },
    lead: true,
  },
  {
    id: 'video',
    src: '/images/gallery-1.webp',
    alt: 'Fotograma de vídeo de uma atuação ao vivo',
    position: 'center center',
    video: true,
    videoSrc: '/videos/hero-video.mp4',
    label: 'Vídeo • Live set',
    area: { gridColumn: '8 / span 5', gridRow: '1 / span 2' },
  },
  {
    id: 'backstage',
    src: '/images/gallery-7.webp',
    alt: 'Retrato de DJ M4rquez em atuação',
    position: 'center 28%',
    caption: { meta: 'Backstage • Porto' },
    area: { gridColumn: '8 / span 5', gridRow: '3' },
  },
  {
    id: 'crowd',
    src: '/images/gallery-1.webp',
    alt: 'Pista cheia durante uma atuação',
    position: 'center 62%',
    caption: { meta: 'Dancefloor • Faro' },
    area: { gridColumn: '1 / span 5', gridRow: '4' },
  },
  {
    id: 'booth',
    src: '/images/gallery-4.webp',
    alt: 'Detalhe da cabine durante o set',
    position: '70% 40%',
    area: { gridColumn: '6 / span 4', gridRow: '4' },
  },
  {
    id: 'portrait',
    src: '/images/artist-portrait.webp',
    alt: 'DJ M4rquez em palco',
    position: 'center 25%',
    area: { gridColumn: '10 / span 3', gridRow: '4' },
  },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox]);

  return (
    <section
      aria-labelledby="momentos"
      style={{ position: 'relative', padding: 'clamp(48px,8vh,96px) clamp(20px,6vw,88px) clamp(56px,8vh,104px)' }}
    >
      <Reveal
        style={{
          maxWidth: 1320,
          margin: '0 auto clamp(28px,4vh,48px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#cf8a3f' }}>
            Media
          </p>
          <h2
            id="momentos"
            style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 'clamp(32px,4.6vw,66px)', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#f5f0e8' }}
          >
            Momentos ao vivo
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'rgba(245,240,232,0.5)', maxWidth: '34ch' }}>
          Uma seleção das noites mais fortes — cabine, pista e palco.
        </p>
      </Reveal>

      <Reveal
        className="m4rqx-mosaic"
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(12,1fr)',
          gridTemplateRows: 'repeat(3,clamp(148px,14.2vw,202px)) clamp(118px,11vw,152px)',
          gap: 'clamp(8px,0.9vw,14px)',
        }}
      >
        {MEDIA.map((item) => (
          <div
            key={item.id}
            className={item.lead ? 'm4rqx-tile m4rqx-tile-lead' : 'm4rqx-tile'}
            role="button"
            tabIndex={0}
            aria-label={item.video ? 'Reproduzir vídeo de atuação' : 'Abrir fotografia: ' + item.alt}
            onClick={() => setLightbox(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightbox(item);
              }
            }}
            style={{ ...item.area, position: 'relative', overflow: 'hidden', background: '#141110', cursor: 'pointer' }}
          >
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.position, display: 'block' }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: item.video
                  ? 'linear-gradient(180deg, rgba(11,10,9,0.15) 0%, rgba(11,10,9,0.55) 100%)'
                  : 'linear-gradient(180deg, rgba(11,10,9,0) 45%, rgba(11,10,9,0.68) 100%)',
                pointerEvents: 'none',
              }}
            />

            {item.video && (
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: '1px solid rgba(245,240,232,0.7)',
                    background: 'rgba(11,10,9,0.28)',
                    backdropFilter: 'blur(3px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '13px solid #f5f0e8', marginLeft: 4 }} />
                </div>
              </div>
            )}

            {item.label && (
              <p style={{ position: 'absolute', left: 'clamp(14px,1.6vw,22px)', bottom: 'clamp(14px,1.6vw,20px)', margin: 0, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.72)', pointerEvents: 'none' }}>
                {item.label}
              </p>
            )}

            {item.caption && (
              <div
                className="m4rqx-tile-meta"
                style={{
                  position: 'absolute',
                  left: 'clamp(14px,2vw,28px)',
                  right: 20,
                  bottom: 'clamp(14px,2vw,26px)',
                  opacity: 0.82,
                  transform: 'translateY(6px)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  pointerEvents: 'none',
                }}
              >
                {item.caption.title && (
                  <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 'clamp(16px,1.6vw,22px)', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f5f0e8' }}>
                    {item.caption.title}
                  </p>
                )}
                <p style={{ margin: item.caption.title ? '4px 0 0' : 0, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.68)' }}>
                  {item.caption.meta}
                </p>
              </div>
            )}
          </div>
        ))}
      </Reveal>

      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}
