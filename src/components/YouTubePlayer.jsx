import { useEffect, useRef, useState } from 'react';
import { loadYouTubeApi } from '../utils/youtubeApi.js';

export default function YouTubePlayer({ videoId, title }) {
  const host = useRef(null);
  const player = useRef(null);
  const replay = useRef(null);
  const focusFallback = useRef(false);
  const [requested, setRequested] = useState(false);
  const [state, setState] = useState('preview');
  const [imageFailed, setImageFailed] = useState(false);
  const [errorCode, setErrorCode] = useState(null);
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

  useEffect(() => {
    if (state === 'failed' && focusFallback.current) host.current.parentElement.querySelector('a')?.focus();
  }, [state]);

  useEffect(() => {
    if (!requested) return undefined;
    let cancelled = false;
    let hasPlayed = false;
    let timer;
    const container = host.current;
    const fail = (reason) => {
      if (cancelled) return;
      cancelled = true;
      focusFallback.current = container.parentElement.contains(document.activeElement);
      window.clearTimeout(timer);
      setErrorCode(reason);
      setState('failed');
      player.current?.destroy();
      player.current = null;
      container.replaceChildren();
    };
    const watchPlayback = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fail('playback-timeout'), 15000);
    };
    setState('loading');
    watchPlayback();
    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      const iframe = document.createElement('iframe');
      iframe.title = `YouTube: ${title}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.tabIndex = -1;
      const params = new URLSearchParams({ enablejsapi: '1', origin: window.location.origin, playsinline: '1', rel: '0', autoplay: '1' });
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params}`;
      container.appendChild(iframe);
      player.current = new YT.Player(iframe, {
        events: {
          onReady: (event) => { if (!cancelled) event.target.playVideo(); },
          onStateChange: (event) => {
            if (cancelled) return;
            if (event.data === YT.PlayerState.PLAYING) {
              hasPlayed = true;
              window.clearTimeout(timer);
              iframe.tabIndex = 0;
              setState('playing');
              if (container.parentElement.contains(document.activeElement)) iframe.focus();
            } else if (event.data === YT.PlayerState.BUFFERING) watchPlayback();
            else if (hasPlayed && (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED)) window.clearTimeout(timer);
          },
          onError: (event) => fail(`youtube-${event.data}`),
          onAutoplayBlocked: () => {
            if (cancelled) return;
            window.clearTimeout(timer);
            setState('blocked');
          },
        },
      });
      replay.current = () => { setState('loading'); watchPlayback(); player.current?.playVideo(); };
    }).catch(() => fail('api-unavailable'));
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      player.current?.destroy();
      player.current = null;
      replay.current = null;
      container.replaceChildren();
    };
  }, [requested, videoId, title]);

  const preview = <>
    <img src={imageFailed ? '/assets/images/hero-poster.webp' : `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
    {state !== 'failed' && <span className="m4rqx-youtube-play" aria-hidden="true">▶</span>}
    <span className="m4rqx-youtube-preview-label">{state === 'failed' ? 'Reprodução indisponível neste leitor.' : state === 'loading' ? 'A carregar vídeo…' : state === 'blocked' ? 'Toca para iniciar o vídeo' : 'Reproduzir vídeo'}</span>
    {state === 'failed' && <span className="m4rqx-youtube-preview-label">Ver no YouTube ↗</span>}
  </>;

  return <>
    <div className={`m4rqx-youtube-frame${requested && state !== 'failed' ? ' is-active' : ''}`} data-player-state={state} data-player-error={errorCode || undefined}>
      <div ref={host} className="m4rq-youtube-host" />
      {state === 'failed' ? <a className="m4rqx-youtube-preview" href={watchUrl} target="_blank" rel="noopener noreferrer">{preview}</a>
        : state !== 'playing' && <button type="button" className="m4rqx-youtube-preview" onClick={() => state === 'blocked' ? replay.current?.() : setRequested(true)} disabled={state === 'loading'} aria-label={`Reproduzir ${title}`}>{preview}</button>}
    </div>
    <p className="m4rq-sr-only" role="status">{state === 'failed' ? 'Vídeo indisponível no leitor. Podes ver no YouTube.' : state === 'loading' ? 'A carregar vídeo.' : ''}</p>
  </>;
}
