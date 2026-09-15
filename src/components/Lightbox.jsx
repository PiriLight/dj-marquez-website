import { useEffect, useRef } from 'react';

export default function Lightbox({ item, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.video ? 'Vídeo em destaque' : 'Fotografia em destaque'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(8,7,6,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5vw',
        animation: 'm4rqFadeIn 0.25s ease both',
      }}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Fechar"
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'rgba(24,18,14,0.5)',
          border: '1px solid rgba(245,240,232,0.3)',
          color: '#f5f0e8',
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 'min(92vw,1000px)', width: '100%' }}>
        {item.video ? (
          // Mounted only once the user clicks a video tile, so nothing is
          // fetched before that interaction. autoPlay starts playback right
          // away at that point (the tile click IS the required interaction) —
          // audio is left on (no muted attribute) and preload="none" makes
          // sure the browser doesn't warm up the file before this element
          // exists in the DOM.
          <video
            src={item.videoSrc}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            preload="none"
            style={{ width: '100%', maxHeight: '84vh', display: 'block', background: '#000' }}
          />
        ) : (
          <img src={item.src} alt={item.alt} style={{ width: '100%', maxHeight: '84vh', objectFit: 'contain', display: 'block' }} />
        )}
      </div>
    </div>
  );
}
