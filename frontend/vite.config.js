import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // SPA fallback: serve index.html for all routes so react-router handles them
    historyApiFallback: true,
  },
})
