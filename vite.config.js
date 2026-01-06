import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'
import path from 'path'
import { createHtmlPlugin } from 'vite-plugin-html';

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'sha256-/AO8vAagk08SqUGxY96ci/dGyTDsuoetPOJYMn7sc+E='",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' https://fonts.googleapis.com",
  "style-src-attr 'none'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*",
  "object-src 'none'",
  "connect-src 'self' ws://localhost:*"
].join("; ");

export default defineConfig({
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    tailwindcss(),
    solid(),
    // createHtmlPlugin({
    //   inject: {
    //     data: {
    //       injectMeta: `<meta http-equiv="Content-Security-Policy" content="${csp};" />`,
    //     }
    //   }
    // }),
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
              "sizes": "72x72",
              "src": "maskable_icon_x72.png",
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
        theme_color: '#242424',
        background_color: '#242424',
        orientation: "portrait"
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
