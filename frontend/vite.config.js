import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Ignore socket disconnect/reset errors
          });
          proxy.on('proxyReqWs', (_proxyReq, _req, socket, _options, _head) => {
            socket.on('error', (err) => {
              // Ignore socket disconnect/reset errors
            });
          });
        },
      },
    },
  },
})

