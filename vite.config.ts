import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'lucide-vendor': ['lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    port: 4173,
    host: true
  },
  server: {
    host: true,
    port: 5173
  }
});