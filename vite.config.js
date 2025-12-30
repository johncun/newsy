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
      registerType: 'prompt',
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
        icons:
          [
            {
              "purpose": "maskable",
              "sizes": "640x640",
              "src": "maskable_icon.png",
              "type": "image/png"
            },
            {
              "purpose": "maskable",
              "sizes": "192x192",
              "src": "maskable_icon_x192.png",
              "type": "image/png"
            },
            {
              "purpose": "maskable",
              "sizes": "512x512",
              "src": "maskable_icon_x512.png",
              "type": "image/png"
            }
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
