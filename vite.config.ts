import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';

/** Vite + CRXJS build for the Chrome extension (popup React app + content script). */
export default defineConfig({
  plugins: [crx({ manifest }), react()],
});
