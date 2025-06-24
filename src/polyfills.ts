import { Buffer } from 'buffer'

// Polyfill Node.js globals for browser environment
if (typeof window !== 'undefined') {
  // Make Buffer available globally
  ;(window as any).Buffer = Buffer
  
  // Make global available
  ;(window as any).global = window
  
  // Provide process.env
  ;(window as any).process = { 
    env: {},
    browser: true,
    version: '',
    versions: {}
  }
  
  // Make Buffer available on globalThis as well
  ;(globalThis as any).Buffer = Buffer
} 