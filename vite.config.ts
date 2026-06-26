import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';

/** Vite + CRXJS build for the Chrome extension (popup React app + content script). */
export default defineConfig({
  plugins: [crx({ manifest }), react()],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
  // Vite 6.0.9+ requires a WebSocket token; the extension service worker can
  // keep a stale token after `vite` restarts, causing handshake 400 errors.
  legacy: {
    skipWebSocketTokenCheck: true,
  },
});
