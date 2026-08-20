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
    src: '/assets/media/foto1.webp',
    alt: 'DJ M4rquez ao ar livre a usar t-shirt da marca',
    position: 'center 32%',
    area: { gridColumn: '1 / span 7', gridRow: '1 / span 3' },
    lead: true,
  },
  {
    id: 'video-1',
    video: true,
    videoSrc: '/assets/media/vid1.mp4',
    poster: '/assets/media/vid1-poster.webp',
    alt: 'Vídeo de um set ao vivo de DJ M4rquez',
    position: 'center center',
    area: { gridColumn: '8 / span 5', gridRow: '1 / span 2' },
  },
  {
    id: 'video-2',
    video: true,
    videoSrc: '/assets/media/vid2.mp4',
    poster: '/assets/media/vid2-poster.webp',
    alt: 'Vídeo de um set ao vivo de DJ M4rquez',
    position: 'center center',
    area: { gridColumn: '8 / span 5', gridRow: '3' },
  },
  {
    id: 'crowd',
    src: '/assets/media/foto3.webp',
    alt: 'DJ M4rquez a atuar com a pista a dançar em volta',
    position: 'center 58%',
    area: { gridColumn: '1 / span 5', gridRow: '4' },
  },
  {
    id: 'booth',
    src: '/assets/media/foto2.webp',
    alt: 'DJ M4rquez na cabine durante um set ao vivo, a preto e branco',
    position: 'center 62%',
    area: { gridColumn: '6 / span 4', gridRow: '4' },
  },
  {
    id: 'portrait',
    src: '/assets/media/foto4.webp',
    alt: 'Retrato de DJ M4rquez com auscultadores',
    position: 'center 28%',
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
      className="m4rqx-gallery-section"
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
        {MEDIA.map((item, index) => (
          <div
            key={item.id}
            className={item.lead ? 'm4rqx-tile m4rqx-tile-lead' : 'm4rqx-tile'}
            role="button"
            tabIndex={0}
            aria-label={item.video ? 'Reproduzir ' + item.alt : 'Abrir fotografia: ' + item.alt}
            onClick={() => setLightbox(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightbox(item);
              }
            }}
            style={{ ...item.area, position: 'relative', overflow: 'hidden', background: '#141110', cursor: 'pointer' }}
          >
            {(item.src || item.poster) && (
              <img
                src={item.src || item.poster}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.position, display: 'block' }}
              />
            )}
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

            <p
              aria-hidden="true"
              style={{ position: 'absolute', left: 'clamp(14px,1.6vw,22px)', bottom: 'clamp(14px,1.6vw,20px)', margin: 0, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.72)', pointerEvents: 'none' }}
            >
              {String(index + 1).padStart(2, '0')}
            </p>
          </div>
        ))}
      </Reveal>

      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}
