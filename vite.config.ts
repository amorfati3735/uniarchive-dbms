import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // The frontend always calls /api; forward it to the Express server so
        // the app works on localhost and on a LAN address alike.
        proxy: {
          '/api': {
            target: env.VITE_API_PROXY || 'http://localhost:5000',
            changeOrigin: true,
          },
        },
      },
      // `vite preview` serves the built bundle and needs the same /api proxy.
      preview: {
        port: 4173,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: env.VITE_API_PROXY || 'http://localhost:5000',
            changeOrigin: true,
          },
        },
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Split the heavy, route-independent libraries out of the entry chunk.
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom', 'react-router-dom'],
              charts: ['recharts'],
            },
          },
        },
      },
    };
});
