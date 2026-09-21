import { useEffect, useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import { InstagramIcon, YouTubeIcon } from '../components/Icons.jsx';
import { SITE_LINKS, YOUTUBE_CONTENT } from '../config/site.js';

export default function Activity() {
  const [playerState, setPlayerState] = useState('preview');
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${YOUTUBE_CONTENT.videoId}?rel=0&autoplay=1`;
  const videoUrl = `https://www.youtube.com/watch?v=${YOUTUBE_CONTENT.videoId}`;

  // Keep a visible preview if the external player is blocked or never loads.
  useEffect(() => {
    if (playerState !== 'loading') return undefined;
    const timeout = window.setTimeout(() => setPlayerState('failed'), 8000);
    return () => window.clearTimeout(timeout);
  }, [playerState]);

  return (
    <section
      id="atividade"
      aria-labelledby="atividade-title"
      className="m4rqx-activity-section"
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg,#0b0a09 0%,#0e0b0a 100%)',
        borderTop: '1px solid rgba(245,240,232,0.07)',
      }}
    >
      <Reveal style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div className="m4rqx-activity-heading">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="m4rqx-eyebrow">Em rotação</p>
            <h2 id="atividade-title" className="m4rqx-section-title">
              Atividade recente
            </h2>
          </div>
          <p className="m4rqx-activity-intro">
            Novos lançamentos, atuações e momentos do percurso de DJ M4rquez.
          </p>
        </div>

        <div className="m4rqx-activity-grid">
          <a
            href={SITE_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="m4rqx-instagram-card"
            aria-label="Seguir DJ M4rquez no Instagram"
          >
            <div className="m4rqx-activity-icon" aria-hidden="true">
              <InstagramIcon size={30} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className="m4rqx-activity-kicker">Instagram</p>
              <p className="m4rqx-instagram-handle">@m4rquezdj</p>
              <p className="m4rqx-activity-copy">
                Bastidores, datas e registos das noites mais recentes.
              </p>
            </div>
            <span className="m4rqx-activity-link">
              Visitar Instagram <span aria-hidden="true">→</span>
            </span>
          </a>

          <article className="m4rqx-youtube-card">
            <div className="m4rqx-youtube-frame">
              {(playerState === 'loading' || playerState === 'ready') && (
                <iframe
                  src={embedUrl}
                  title={`YouTube: ${YOUTUBE_CONTENT.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onLoad={() => setPlayerState('ready')}
                  onError={() => setPlayerState('failed')}
                />
              )}
              {playerState === 'failed' ? (
                <a className="m4rqx-youtube-preview" href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <span className="m4rqx-youtube-preview-label" role="status">O player não carregou.</span>
                  <span className="m4rqx-youtube-preview-label">Ver {YOUTUBE_CONTENT.title} no YouTube ↗</span>
                </a>
              ) : playerState !== 'ready' && (
                <button
                  type="button"
                  className="m4rqx-youtube-preview"
                  onClick={() => setPlayerState('loading')}
                  disabled={playerState === 'loading'}
                  aria-label={`Reproduzir ${YOUTUBE_CONTENT.title}`}
                >
                  {!thumbnailFailed && (
                    <img
                      src={`https://i.ytimg.com/vi/${YOUTUBE_CONTENT.videoId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={() => setThumbnailFailed(true)}
                    />
                  )}
                  <span className="m4rqx-youtube-play" aria-hidden="true">▶</span>
                  <span className="m4rqx-youtube-preview-label" role="status">
                    {playerState === 'loading' ? 'A carregar vídeo…' : thumbnailFailed ? `Reproduzir ${YOUTUBE_CONTENT.title}` : 'Reproduzir vídeo'}
                  </span>
                </button>
              )}
            </div>
            <div className="m4rqx-youtube-meta">
              <div>
                <p className="m4rqx-activity-kicker">
                  <YouTubeIcon size={18} /> Último vídeo
                </p>
                <h3>{YOUTUBE_CONTENT.title}</h3>
                {playerState !== 'preview' && (
                  <a className="m4rqx-video-fallback" href={videoUrl} target="_blank" rel="noopener noreferrer">
                    Abrir no YouTube ↗
                  </a>
                )}
              </div>
              <a className="m4rqx-activity-link" href={SITE_LINKS.youtube} target="_blank" rel="noopener noreferrer">
                Ver canal <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        </div>
      </Reveal>
    </section>
  );
}
