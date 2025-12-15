import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@wasilni/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    strictPort: false,
    allowedHosts: ['.manusvm.computer'],
    proxy: {
      '/api': {
        target: 'https://3001-i38ky9reaf15140rnrl0z-807a6cb4.manusvm.computer',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
