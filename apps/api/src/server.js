import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDB } from './db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer();

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] }
});

const app = createApp(io);
server.on('request', app);

io.on('connection', socket => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.emit('telemetry:update', { activeResponders: 8, systemLoad: '14%', socketId: socket.id });
  socket.on('disconnect', () => console.log(`[Socket.IO] Client disconnected: ${socket.id}`));
});

connectDB().then(() => {
  server.listen(PORT, () => console.log(`[CivicAI API] Running on http://localhost:${PORT}`));
});
