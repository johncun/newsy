import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'


export default defineConfig({
  plugins: [
    tailwindcss(), solid()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
})
