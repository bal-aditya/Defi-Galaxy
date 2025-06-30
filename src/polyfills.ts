// Polyfill Node.js globals for browser environment
if (typeof window !== 'undefined') {
  // Make global available
  ;(window as any).global = window
  
  // Provide process.env
  ;(window as any).process = { 
    env: {},
    browser: true,
    version: '',
    versions: {}
  }
}

// Import Buffer and make it available globally
import { Buffer } from 'buffer'

if (typeof window !== 'undefined') {
  ;(window as any).Buffer = Buffer
}

if (typeof global !== 'undefined') {
  ;(global as any).Buffer = Buffer
}

;(globalThis as any).Buffer = Buffer 