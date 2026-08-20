import Reveal from '../components/Reveal.jsx';

export default function Booking() {
  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      style={{
        position: 'relative',
        padding: 'clamp(64px,10vh,128px) clamp(20px,6vw,88px)',
        background: 'linear-gradient(180deg,#0b0a09 0%,#100d0b 100%)',
        borderTop: '1px solid rgba(245,240,232,0.07)',
      }}
    >
      <Reveal
        className="m4rqx-booking"
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,0.75fr)',
          gap: 'clamp(36px,6vw,96px)',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px,2.4vw,28px)' }}>
          <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#cf8a3f' }}>
            Booking
          </p>
          <h2
            id="booking-title"
            style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 'clamp(32px,4.4vw,62px)', lineHeight: 0.98, letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#f5f0e8', textWrap: 'balance' }}
          >
            Leva o som para a tua noite
          </h2>
          <p style={{ margin: 0, fontSize: 'clamp(15px,1.2vw,17px)', lineHeight: 1.7, color: 'rgba(245,240,232,0.62)', maxWidth: '44ch' }}>
            Para atuações, eventos e informações profissionais.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <a
              href="#booking"
              className="m4rqx-solid"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 32px',
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
              Agendar artista →
            </a>
            <a
              href="#beatwave-contact"
              className="m4rqx-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 28px',
                border: '1px solid rgba(207,138,63,0.45)',
                color: '#f5f0e8',
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 500,
                fontSize: 13,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 2,
                minHeight: 52,
                boxSizing: 'border-box',
                transition: 'border-color 0.25s ease, background 0.25s ease',
              }}
            >
              Contactar Beat Wave
            </a>
          </div>
        </div>

        <div className="m4rqx-agency" style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingLeft: 'clamp(0px,3vw,44px)', borderLeft: '1px solid rgba(245,240,232,0.1)' }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.38)' }}>Representação</p>
          <img
            src="/images/beatwave-logo.webp"
            alt="Beat Wave"
            loading="lazy"
            decoding="async"
            style={{ width: 'clamp(132px,12vw,180px)', height: 'auto', objectFit: 'contain', display: 'block', filter: 'invert(1) brightness(0.96)', mixBlendMode: 'screen' }}
          />
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'rgba(245,240,232,0.72)', maxWidth: '34ch' }}>
            DJ M4rquez é representado pela <strong style={{ color: '#f5f0e8', fontWeight: 600 }}>Beat Wave</strong>. Para informações
            profissionais, atuações e booking, contacte a agência.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
