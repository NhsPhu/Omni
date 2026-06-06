import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix: sockjs-client uses Node.js `global`, polyfill it for browser
    global: 'globalThis',
  },
})
