let apiPromise;

// Download the official API only on demand, shared across mounts.
export function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const previousReady = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => finish(new Error('YouTube API timeout')), 12000);
    function finish(error) {
      window.clearTimeout(timeout);
      script.onerror = null;
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previousReady;
      if (error) { script.remove(); reject(error); }
      else resolve(window.YT);
    }
    function ready() { finish(); previousReady?.(); }
    window.onYouTubeIframeAPIReady = ready;
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => finish(new Error('YouTube API unavailable'));
    document.head.appendChild(script);
  }).catch((error) => { apiPromise = undefined; throw error; });
  return apiPromise;
}
