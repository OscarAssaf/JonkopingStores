import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
      '/login': 'http://localhost:3001',
      '/logout': 'http://localhost:3001',
    },
  },
  preview: {
    port: 3000,
    proxy: {
      '/api': 'http://host.docker.internal:3001',
      '/login': 'http://host.docker.internal:3001',
      '/logout': 'http://host.docker.internal:3001',
    },
  },
  build: {
    outDir: 'dist',
  },
})
