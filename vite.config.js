import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3003',
      '/login': 'http://localhost:3003',
      '/logout': 'http://localhost:3003',
      '/callback': 'http://localhost:3003',
    },
  },
});
