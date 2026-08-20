import Reveal from '../components/Reveal.jsx';

const FACTS = [
  { label: 'Base', value: 'Portugal' },
  { label: 'Som', value: 'Afro House' },
  { label: 'Formato', value: 'Live Performances' },
];

export default function About() {
  return (
    <section
      aria-labelledby="bio-name"
      style={{ position: 'relative', padding: 'clamp(120px,22vh,260px) clamp(20px,6vw,88px) clamp(72px,10vh,120px)' }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '22%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          maxWidth: 900,
          maxHeight: 900,
          background: 'radial-gradient(circle, rgba(207,138,63,0.12) 0%, rgba(207,138,63,0) 62%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="m4rqx-bio"
        style={{
          position: 'relative',
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,0.92fr) minmax(0,1fr)',
          gap: 'clamp(32px,5vw,80px)',
          alignItems: 'end',
        }}
      >
        <Reveal style={{ position: 'relative' }}>
          <img
            src="/assets/images/artist-portrait.webp"
            alt="DJ M4rquez a atuar em palco"
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              display: 'block',
              filter: 'saturate(0.92) contrast(1.06)',
              WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 16%, #000 72%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 16%, #000 72%, rgba(0,0,0,0) 100%)',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(11,10,9,0.55) 0%, rgba(11,10,9,0) 38%)',
              pointerEvents: 'none',
            }}
          />
        </Reveal>

        <Reveal
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(20px,2.6vw,30px)',
            paddingBottom: 'clamp(0px,4vh,48px)',
          }}
        >
          <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.42)' }}>
            O Artista
          </p>

          <h2
            id="bio-name"
            style={{
              margin: 0,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(48px,8.4vw,132px)',
              lineHeight: 0.88,
              letterSpacing: '-0.015em',
              textTransform: 'uppercase',
              color: '#f5f0e8',
            }}
          >
            DJ M4rquez
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span aria-hidden="true" style={{ width: 'clamp(28px,5vw,72px)', height: 1, background: '#cf8a3f', flexShrink: 0 }} />
            <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 'clamp(12px,1.2vw,15px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#cf8a3f' }}>
              Afro House &bull; Afro Tech &bull; Afrobeat
            </p>
          </div>

          <p style={{ margin: 0, fontSize: 'clamp(15px,1.25vw,18px)', lineHeight: 1.75, color: 'rgba(245,240,232,0.7)', maxWidth: '48ch', textWrap: 'pretty' }}>
            Rooted in the rhythms of Afro House and driven by an unmistakable urban energy, DJ M4rquez has built a
            reputation for sets that move crowds from the first beat. Every performance blends deep grooves with raw,
            dancefloor intensity. A Portuguese artist with an international sound.
          </p>

          <div
            className="m4rqx-metarow"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
              gap: 'clamp(16px,2vw,28px)',
              marginTop: 'clamp(8px,2vh,20px)',
              borderTop: '1px solid rgba(245,240,232,0.1)',
              paddingTop: 'clamp(18px,2.6vh,28px)',
            }}
          >
            {FACTS.map((fact) => (
              <div key={fact.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.38)' }}>{fact.label}</span>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 'clamp(15px,1.5vw,19px)', letterSpacing: '0.04em', color: '#f5f0e8' }}>{fact.value}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
