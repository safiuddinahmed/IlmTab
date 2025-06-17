import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and core libraries
          vendor: ['react', 'react-dom'],
          // Material-UI chunk (large library)
          mui: ['@mui/material', '@mui/icons-material'],
          // Redux chunk
          redux: ['@reduxjs/toolkit', 'react-redux'],
          // Utilities chunk
          utils: ['axios', 'dayjs']
        }
      }
    },
    // Reduce chunk size warning limit since we're optimizing
    chunkSizeWarningLimit: 300,
    // Enable minification optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        dead_code: true,
        // Optimize conditionals
        conditionals: true,
        // Optimize comparisons
        comparisons: true,
        // Optimize sequences
        sequences: true,
        // Remove unused variables
        unused: true
      },
      mangle: {
        // Mangle variable names for smaller size
        safari10: true
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Source maps for debugging (disable in production)
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
      'dayjs'
    ]
  }
})
