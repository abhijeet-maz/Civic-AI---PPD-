import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite logs "ws proxy socket error" whenever the browser drops a Socket.IO websocket abruptly
// (page reload / tab close - ECONNRESET / EPIPE, or ECONNABORTED on Windows). It is harmless, and the
// proxy `configure` hook below cannot silence it because Vite adds its own listener afterwards.
// Filter ONLY that message for those three error codes; every other error is still printed.
const logger = createLogger();
const logError = logger.error;
logger.error = (msg, options) => {
  const code = options?.error?.code;
  if (typeof msg === 'string' && msg.includes('ws proxy socket error') && ['ECONNRESET', 'ECONNABORTED', 'EPIPE'].includes(code)) return;
  logError(msg, options);
};

export default defineConfig({
  customLogger: logger,
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            // Ignore socket disconnects on dev server / HMR / page reloads
          });
          proxy.on('proxyReqWs', (proxyReq, req, socket) => {
            socket.on('error', (err) => {
              // Catch and suppress ECONNABORTED / ECONNRESET on socket connection
            });
          });
        }
      }
    }
  }
});


