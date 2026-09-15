import Reveal from '../components/Reveal.jsx';
import { InstagramIcon, YouTubeIcon } from '../components/Icons.jsx';
import { SITE_LINKS, YOUTUBE_CONTENT } from '../config/site.js';

export default function Activity() {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${YOUTUBE_CONTENT.videoId}?rel=0`;

  return (
    <section
      id="atividade"
      aria-labelledby="atividade-title"
      style={{
        position: 'relative',
        padding: 'clamp(64px,10vh,124px) clamp(20px,6vw,88px)',
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
              <iframe
                src={embedUrl}
                title={`YouTube: ${YOUTUBE_CONTENT.title}`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="m4rqx-youtube-meta">
              <div>
                <p className="m4rqx-activity-kicker">
                  <YouTubeIcon size={18} /> Último vídeo
                </p>
                <h3>{YOUTUBE_CONTENT.title}</h3>
              </div>
              <a href={SITE_LINKS.youtube} target="_blank" rel="noopener noreferrer">
                Ver canal <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        </div>
      </Reveal>
    </section>
  );
}
