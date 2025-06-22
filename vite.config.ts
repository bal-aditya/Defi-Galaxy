import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist-ui',
    sourcemap: true,
    rollupOptions: {
      external: ['@noble/hashes'],
    },
  },
  optimizeDeps: {
    include: ['@jup-ag/terminal'],
    exclude: ['@noble/hashes'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  }
}) 