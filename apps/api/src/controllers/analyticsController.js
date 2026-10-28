import { incidentRepository } from '../repositories/incidentRepository.js';

export async function getAnalytics(req, res) {
  const all = await incidentRepository.getAll();
  const byStatus = all.reduce((a, i) => ({ ...a, [i.status]: (a[i.status] || 0) + 1 }), {});
  const bySeverity = all.reduce((a, i) => ({ ...a, [i.severity]: (a[i.severity] || 0) + 1 }), {});
  const resolved = i => ['RESOLVED', 'CLOSED', 'Resolved'].includes(i.status);
  res.json({
    success: true,
    totalIncidents: all.length,
    activeIncidents: all.filter(i => !resolved(i)).length,
    resolvedIncidents: all.filter(resolved).length,
    avgUrgencyScore: Math.round(all.reduce((a, i) => a + (i.urgencyScore || 50), 0) / (all.length || 1)),
    byStatus, bySeverity
  });
}
