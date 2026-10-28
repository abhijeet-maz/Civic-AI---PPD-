import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { listIncidents, createIncident, updateStatus, addProgress, addFeedback, patchIncident, resolveIncident } from '../controllers/incidentController.js';

const router = express.Router();
router.get('/', listIncidents);
router.post('/', createIncident);
router.patch('/:id/status', authenticateToken, requireRole(['Official', 'Worker']), updateStatus);
router.post('/:id/status', authenticateToken, requireRole(['Official', 'Worker']), updateStatus);
router.post('/:id/progress', authenticateToken, requireRole(['Official', 'Worker']), addProgress);
router.post('/:id/feedback', addFeedback);
router.patch('/:id', authenticateToken, requireRole(['Official', 'Worker']), patchIncident);
router.post('/:id/resolve', authenticateToken, requireRole(['Official', 'Worker']), resolveIncident);
export default router;
