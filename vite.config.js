import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: [
        '**/*_frames*/**',
        '**/*-frames*/**',
        '**/hero_*/**',
        '**/hero-*/**',
        '**/coffee_*/**',
        '**/pizza_*/**',
        '**/momos_*/**',
        '**/wagyu_*/**',
        '**/Pouring_*/**',
        '**/public/frames/**',
        '**/public/images/**',
        '**/dist/**'
      ]
    }
  }
});
