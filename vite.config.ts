// vite.config.ts - نسخه ساده
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false,
  },
   resolve: {
    alias: {
          '@': path.resolve(__dirname, './src'),
          '@components': path.resolve(__dirname, './src/components'),
          '@utils': path.resolve(__dirname, './src/utils'),
          '@pages': path.resolve(__dirname, './src/pages'),
          '@hooks': path.resolve(__dirname, './src/hooks'),
          '@types': path.resolve(__dirname, './src/core/types'),
          '@api': path.resolve(__dirname, './src/api'),
          '@modules': path.resolve(__dirname, './src/modules'),
          '@core': path.resolve(__dirname, './src/core'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
});