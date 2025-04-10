import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default defineConfig({
  plugins: [
    react(),
    polyfillNode() // Use the correct polyfill
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Path alias for cleaner imports
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis' // Fix SimplePeer's 'global' error
      }
    }
  },
  define: {
    global: 'globalThis'
  }
});
