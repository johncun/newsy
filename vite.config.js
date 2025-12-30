import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    solid(),
    VitePWA({
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      srcDir: 'src',
      filename: 'sw.ts',
      devOptions: {
        enabled: true, // Enable the plugin in dev mode
        type: 'module', // Required if you use ESM in your service worker
        navigateFallback: 'index.html',
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      injectManifest: {
        swDest: 'dist/sw.js',
      },
      manifest: {
        name: 'Cuisle',
        short_name: 'Cuisle',
        description: 'Modern news reader',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        display: 'standalone',
        theme_color: '#120a0a',
        background_color: '#120a0a',
      },
    }),
  ],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
})
