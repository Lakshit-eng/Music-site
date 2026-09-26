import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development, requests to /api and /uploads are forwarded to the
// backend server, so the frontend can just call fetch('/api/...') without
// worrying about the backend's port or CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
