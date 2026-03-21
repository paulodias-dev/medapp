import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }

          if (id.includes('@tanstack/react-query') || id.includes('@tanstack/react-table')) {
            return 'tanstack-vendor';
          }

          if (id.includes('radix-ui') || id.includes('cmdk')) {
            return 'ui-vendor';
          }

          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
            return 'forms-vendor';
          }

          if (id.includes('@phosphor-icons') || id.includes('lucide-react')) {
            return 'icons-vendor';
          }

          if (id.includes('axios') || id.includes('jwt-decode')) {
            return 'network-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
