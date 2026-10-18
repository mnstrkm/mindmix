import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_PATH || '/mindmix/';
export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
    manifest: {
      name: 'MindMix', short_name: 'MindMix', description: 'Kleine Spiele, große Spielfreude.',
      lang: 'de', theme_color: '#173e37', background_color: '#f6f5f0',
      display: 'standalone', start_url: base, scope: base, id: base,
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      ],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'], cleanupOutdatedCaches: true,
      navigateFallback: `${base}index.html`, maximumFileSizeToCacheInBytes: 4 * 1024 * 1024 },
  })],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], include: ['src/**/*.test.{ts,tsx}'], restoreMocks: true },
});
