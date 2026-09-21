import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { checkSupabaseConfig } from './src/utils/supabaseConfig.js';

// Invitation URLs contain one-time hashes. Scope these headers to activation;
// the homepage/YouTube player's existing referrer behaviour stays unchanged.
function protectSetupRoute(server) {
  server.middlewares.use((request, response, next) => {
    if (request.url?.split('?')[0].replace(/\/+$/, '') === '/auth/setup-password') {
      response.setHeader('Referrer-Policy', 'no-referrer');
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('X-Robots-Tag', 'noindex, nofollow');
      // Vite's HTML middleware sets no-cache later; retain no-store on this route.
      const writeHead = response.writeHead;
      response.writeHead = function (...args) {
        this.setHeader('Cache-Control', 'no-store');
        return writeHead.apply(this, args);
      };
    }
    next();
  });
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
  const url = env.VITE_SUPABASE_URL?.trim();
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();
  const result = checkSupabaseConfig(url, key);
  // Stop before bundling a misconfigured or privileged browser credential.
  if ((url || key) && !result.configured) throw new Error(result.error);
  return { plugins: [react(), { name: 'private-activation-headers', configureServer: protectSetupRoute, configurePreviewServer: protectSetupRoute }] };
});
