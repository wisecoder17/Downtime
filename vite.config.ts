import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@journeyapps/wa-sqlite', '@powersync/web'],
  },
  server: {
    proxy: {
      '/api/sync': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
