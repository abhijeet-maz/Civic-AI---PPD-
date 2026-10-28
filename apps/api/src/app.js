import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import incidentRoutes from './routes/incidentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { incidentRepository } from './repositories/incidentRepository.js';

export function createApp(io) {
  const app = express();
  app.set('io', io);
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(helmet({ contentSecurityPolicy: false }));

  app.get('/health', (req, res) => res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CivicAI API',
    mongoConnected: incidentRepository.isMongoConnected()
  }));

  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/ai', aiRoutes);

  app.use((err, req, res, next) => {
    console.error('[API Error]', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
  });

  return app;
}
