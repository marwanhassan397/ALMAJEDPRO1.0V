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
    // Optional convenience for local development:
    // If you run Apache/PHP on http://localhost (XAMPP),
    // Vite dev server (http://localhost:5173) can proxy API calls.
    proxy: {
      '/api': 'http://localhost',
    },
  },
});
