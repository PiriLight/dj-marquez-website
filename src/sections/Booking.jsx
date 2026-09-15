import Reveal from '../components/Reveal.jsx';
import { SITE_LINKS } from '../config/site.js';

export default function Booking() {
  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      style={{
        position: 'relative',
        isolation: 'isolate',
        padding: 'clamp(64px,10vh,128px) clamp(20px,6vw,88px)',
        background: 'linear-gradient(180deg,#0b0a09 0%,#100d0b 100%)',
        borderTop: '1px solid rgba(245,240,232,0.07)',
      }}
    >
      {/* Decorative branded texture. The source is an almost-black logo pattern
          (mean luma ~11, i.e. the page background), so it is lifted with
          brightness rather than opacity — dropping opacity would only erase it.
          The gradients handle edge integration, and the lift is tuned so the
          section's mean luminance still lands within ~1 of the site base, which
          is what keeps the block from reading as a lighter rectangle. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <img
          src="/assets/images/123.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="m4rqx-booking-bg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Vertical fade — solid at both edges so the texture never shows a
            seam against Agenda above or the footer below, but deliberately
            light through the middle: the source is already near-black, so this
            is feathering the edges, not dimming the image. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #0b0a09 0%, rgba(11,10,9,0.38) 9%, rgba(13,11,10,0.03) 42%, rgba(16,13,11,0.4) 89%, #100d0b 100%)',
          }}
        />

        {/* Side vignette. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(11,10,9,0.46) 0%, rgba(11,10,9,0) 20%, rgba(11,10,9,0) 80%, rgba(16,13,11,0.46) 100%)',
          }}
        />

        {/* Soft pool keeping the headline and CTAs clear of the pattern. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(115% 65% at 38% 50%, rgba(8,7,6,0.22) 0%, rgba(8,7,6,0.09) 50%, rgba(8,7,6,0) 78%)',
          }}
        />
      </div>

      <Reveal
        className="m4rqx-booking"
        style={{
          position: 'relative',
          zIndex: 1,
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
            <a
              href={SITE_LINKS.booking}
              className="m4rqx-primary-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 44px',
                background: '#cf8a3f',
                color: '#0b0a09',
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 0,
                minHeight: 60,
                boxSizing: 'border-box',
                boxShadow: '0 12px 32px rgba(207,138,63,0.22)',
                transition: 'background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              <span>Agendar Artista</span>
              <span className="m4rq-arrow" aria-hidden="true" style={{ display: 'inline-flex', transition: 'transform 0.25s ease' }}>
                →
              </span>
            </a>
          </div>
        </div>

        <div className="m4rqx-agency" style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingLeft: 'clamp(0px,3vw,44px)', borderLeft: '1px solid rgba(245,240,232,0.1)' }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.38)' }}>Representação</p>
          <img
            src="/assets/images/beatwave-logo.webp"
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
