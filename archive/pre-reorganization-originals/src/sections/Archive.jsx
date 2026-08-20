import Reveal from '../components/Reveal.jsx';

/**
 * PLACEHOLDER — replace with the final Google Drive share URL before launch.
 * Keep target="_blank" + rel="noopener noreferrer" so it opens safely.
 */
const GOOGLE_DRIVE_URL = '#google-drive-url';

export default function Archive() {
  return (
    <section
      aria-labelledby="arquivo"
      style={{ position: 'relative', padding: 'clamp(24px,4vh,56px) clamp(20px,6vw,88px) clamp(72px,10vh,120px)' }}
    >
      <Reveal
        className="m4rqx-archive"
        style={{
          position: 'relative',
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)',
          alignItems: 'stretch',
          overflow: 'hidden',
          background: '#100d0b',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(18px,2.4vw,28px)', padding: 'clamp(36px,5vw,72px)' }}>
          <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#cf8a3f' }}>
            Arquivo
          </p>
          <h2
            id="arquivo"
            style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 'clamp(30px,3.6vw,54px)', lineHeight: 1.02, letterSpacing: '-0.01em', color: '#f5f0e8', textWrap: 'balance' }}
          >
            Todas as noites.
            <br />
            Num só lugar.
          </h2>
          <p style={{ margin: 0, fontSize: 'clamp(15px,1.2vw,17px)', lineHeight: 1.7, color: 'rgba(245,240,232,0.62)', maxWidth: '42ch' }}>
            Explora o arquivo completo de fotografias e vídeos de cada atuação.
          </p>
          <a
            href={GOOGLE_DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="m4rqx-solid"
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 30px',
              background: '#cf8a3f',
              color: '#0b0a09',
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: 2,
              minHeight: 52,
              boxSizing: 'border-box',
              transition: 'background 0.25s ease, transform 0.25s ease',
            }}
          >
            Explorar arquivo →
          </a>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.06em', color: 'rgba(245,240,232,0.38)' }}>
            Ficheiros disponíveis para download em qualidade original.
          </p>
        </div>

        <div style={{ position: 'relative', minHeight: 'clamp(260px,32vw,460px)', overflow: 'hidden' }}>
          <img
            src="/images/gallery-4.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.35) brightness(0.62)' }}
          />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #100d0b 0%, rgba(16,13,11,0.55) 42%, rgba(16,13,11,0.25) 100%)' }} />
          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.014) 0px, rgba(255,255,255,0.014) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)' }}
          />
        </div>
      </Reveal>
    </section>
  );
}
