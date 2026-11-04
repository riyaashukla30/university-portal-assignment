import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mockMiddleware } from './mock/server.js';

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'local-assignment-api',
    configureServer(server) { server.middlewares.use(mockMiddleware); },
    configurePreviewServer(server) { server.middlewares.use(mockMiddleware); },
  }],
});
