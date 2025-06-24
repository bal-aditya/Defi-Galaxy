import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
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
    sourcemap: false,
    rollupOptions: {
      external: (id) => {
        // Exclude all Trezor-related packages that have syntax errors
        return id.includes('@trezor/') || 
               id.includes('trezor') || 
               id.includes('@trezor/connect-common') ||
               id.includes('@trezor/env-utils')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          solana: ['@solana/web3.js', '@solana/wallet-adapter-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@jup-ag/terminal', 'buffer'],
    exclude: ['@noble/hashes', '@trezor/connect-common', '@trezor/env-utils'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  }
}) 