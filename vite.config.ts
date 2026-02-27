import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * IMPORTANT:
 * - base: './' makes the build portable (root or subfolder).
 * - index.html also writes a runtime <base href="..."> to make deep routes work when served by Apache.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
