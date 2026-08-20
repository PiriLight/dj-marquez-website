import SocialLinks from '../components/SocialLinks.jsx';

export default function Footer() {
  return (
    <footer style={{ position: 'relative', background: '#08070c', padding: 'clamp(48px,7vh,80px) clamp(20px,6vw,88px) clamp(26px,4vh,36px)' }}>
      <div
        className="m4rqx-footer-top"
        style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}
      >
        <img src="/assets/images/logo-m4rquez.png" alt="DJ M4rquez" loading="lazy" style={{ width: 'clamp(120px,12vw,160px)', height: 'auto', display: 'block' }} />

        <SocialLinks size="small" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src="/assets/images/beatwave-logo.webp"
            alt="Beat Wave"
            loading="lazy"
            style={{ width: 72, height: 'auto', objectFit: 'contain', display: 'block', filter: 'invert(1) brightness(0.9)', mixBlendMode: 'screen', opacity: 0.9 }}
          />
          <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>
            Representado pela Beat Wave
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: 'clamp(28px,4vh,44px) auto 0', paddingTop: 22, borderTop: '1px solid rgba(245,240,232,0.08)' }}>
        {/* Wraps to two lines on narrow screens instead of overflowing; the
            separator hides itself when it would be left dangling at a wrap. */}
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(245,240,232,0.35)',
            letterSpacing: '0.02em',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '4px 10px',
          }}
        >
          <span>© 2026 DJ M4rquez. Todos os direitos reservados.</span>
          <span>
            <span aria-hidden="true" style={{ marginRight: 10, opacity: 0.5 }}>
              ·
            </span>
            Produzido por{' '}
            <a
              href="https://pirilight.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="m4rq-credit"
            >
              PiriLight Studio
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}
