import { defineConfig } from 'vite';

// base: './' supaya hasil build bisa dibuka dari subfolder (mis. XAMPP/htdocs)
// maupun hosting statis (Vercel/Netlify/GitHub Pages).
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
