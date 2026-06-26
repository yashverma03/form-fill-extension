import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Form Filler',
  version: '1.0.0',
  description: 'Auto-fills job application forms',
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '48': 'icons/icon48.png',
    },
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['activeTab', 'scripting'],
  host_permissions: ['<all_urls>'],
});
