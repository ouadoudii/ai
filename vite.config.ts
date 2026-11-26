import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), {
      name: 'rhythm-build-identity',
      apply: 'build',
      transformIndexHtml() {
        const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local';
        if (process.env.VERCEL_ENV === 'production' && !/^[a-f0-9]{40}$/.test(sha)) {
          throw new Error('Missing production build commit SHA');
        }
        return [{tag: 'meta', attrs: {name: 'rhythm-build-sha', content: sha}, injectTo: 'head'}];
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
