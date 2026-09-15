import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Event detail modal — a small "event page" surfaced in place instead of a
 * new route. Fully data-driven: see EVENTS in ../sections/Events.jsx for the
 * shape (date, name, location, description, poster, ticketUrl, time, venue).
 * Nothing here invents copy — fields that aren't confirmed yet simply don't
 * render.
 */
export default function EventModal({ event, onClose, returnFocusRef }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  // Lock body scroll while open, restore whatever it was on close.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Initial focus, Escape-to-close, and a focus trap confined to the panel.
  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Hand keyboard focus back to whatever opened this modal once it unmounts.
  useEffect(
    () => () => {
      returnFocusRef?.current?.focus();
    },
    [returnFocusRef]
  );

  return (
    <div
      className="m4rqx-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(6,5,5,0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(0px,4vw,24px)',
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="m4rqx-event-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="m4rqx-modal-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#100d0b',
          border: '1px solid rgba(245,240,232,0.14)',
          padding: 'clamp(32px,6vw,56px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(16px,2.4vw,22px)',
          boxSizing: 'border-box',
        }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="m4rqx-modal-close"
          style={{
            position: 'absolute',
            top: 'clamp(16px,2.4vw,24px)',
            right: 'clamp(16px,2.4vw,24px)',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(245,240,232,0.22)',
            background: 'rgba(245,240,232,0.04)',
            color: '#f5f0e8',
            fontSize: 20,
            lineHeight: 1,
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, background 0.2s ease',
          }}
        >
          ×
        </button>

        <p style={{ margin: '0 40px 0 0', fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#cf8a3f' }}>
          Próximo evento
        </p>

        <h3
          id="m4rqx-event-modal-title"
          style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 'clamp(28px,4.2vw,42px)', lineHeight: 1.02, letterSpacing: '-0.01em', color: '#f5f0e8' }}
        >
          {event.date}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 'clamp(22px,3.2vw,30px)', color: '#f5f0e8' }}>
            {event.name}
          </p>
          <p style={{ margin: 0, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.55)' }}>
            {[event.location, event.venue, event.time].filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* Reserved for future detail copy (lineup, schedule, etc.) — renders
            only once `description` is supplied on the event object. */}
        {event.description && (
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'rgba(245,240,232,0.68)' }}>
            {event.description}
          </p>
        )}

        <div style={{ marginTop: 8 }}>
          {event.ticketUrl ? (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="m4rqx-primary-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 36px',
                background: '#cf8a3f',
                color: '#0b0a09',
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 12px 32px rgba(207,138,63,0.22)',
                transition: 'background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              <span>Comprar bilhetes</span>
              <span aria-hidden="true">→</span>
            </a>
          ) : (
            <span
              className="m4rqx-status-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,232,0.42)',
              }}
            >
              <span
                aria-hidden="true"
                style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(245,240,232,0.32)', flexShrink: 0 }}
              />
              Bilhetes em breve
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
