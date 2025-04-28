import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat-stream': { target: 'http://localhost:8081', changeOrigin: true },
      '/upload':      { target: 'http://localhost:8081', changeOrigin: true },
      '/chat':        { target: 'http://localhost:8081', changeOrigin: true }
    }
  }
})
