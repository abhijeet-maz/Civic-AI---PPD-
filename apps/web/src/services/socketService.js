import { io } from 'socket.io-client';

export function connectCivicSocket(handlers = {}) {
  const socket = io('/', { transports: ['websocket', 'polling'] });
  socket.on('connect', () => handlers.onConnect?.());
  socket.on('disconnect', () => handlers.onDisconnect?.());
  socket.on('incident:created', incident => handlers.onIncidentCreated?.(incident));
  socket.on('incident:updated', incident => handlers.onIncidentUpdated?.(incident));
  return () => socket.disconnect();
}
