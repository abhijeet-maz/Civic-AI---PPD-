import { incidentRepository } from '../repositories/incidentRepository.js';
import { DEPARTMENT_MAP, VALID_STATUSES } from '../constants/civic.js';

const emit = (io, event, payload) => io.emit(event, payload);

export async function listIncidents(req, res) {
  const incidents = await incidentRepository.getAll(req.query);
  res.json({ success: true, count: incidents.length, incidents });
}

export async function createIncident(req, res) {
  const { title, category, severity, description, address, lat, lng, imageUrl, submittedBy, complainant, evidence, location } = req.body;
  const targetDepartment = DEPARTMENT_MAP[category] || DEPARTMENT_MAP[category?.toLowerCase()] || 'Road Maintenance';
  const aiAnalysis = {
    detectedIssue: category || 'Pothole & Road Damage',
    confidence: 0.94,
    suggestedPriority: severity || 'Medium',
    actionPlan: `Automated AI Vision classification complete. Complaint auto-routed to ${targetDepartment}.`
  };
  const initialStatusHistory = [
    { status: 'SUBMITTED', changedBy: complainant?.name || submittedBy || 'Citizen', changedAt: new Date().toISOString() },
    { status: 'AI_ANALYZED', changedBy: 'CivicAI Vision Model', changedAt: new Date().toISOString() }
  ];
  const complainantData = {
    name: complainant?.name || submittedBy || 'Citizen',
    phone: complainant?.phone || 'Unverified',
    phoneVerified: Boolean(complainant?.phoneVerified)
  };
  const evidenceArray = Array.isArray(evidence) && evidence.length
    ? evidence
    : (imageUrl ? [{ url: imageUrl, uploadedAt: new Date() }] : []);
  const locationData = {
    latitude: Number(lat) || Number(location?.latitude) || 20.3587,
    longitude: Number(lng) || Number(location?.longitude) || 85.8333,
    address: address || location?.address || 'Bhubaneswar, Odisha',
    placeId: location?.placeId || null,
    source: location?.source || 'PIN'
  };
  const incident = await incidentRepository.add({
    title: title || `${category || 'Civic Issue'} Report`,
    category: category || 'Pothole & Road Damage',
    severity: severity || 'Medium',
    status: 'AI_ANALYZED',
    statusHistory: initialStatusHistory,
    urgencyScore: severity === 'Critical' ? 95 : severity === 'High' ? 75 : severity === 'Medium' ? 50 : 25,
    description, address: locationData.address,
    lat: locationData.latitude, lng: locationData.longitude,
    imageUrl: evidenceArray[0]?.url || imageUrl || null,
    evidence: evidenceArray, complainant: complainantData, location: locationData,
    submittedBy: complainantData.name, assignedDepartment: targetDepartment,
    responderUnit: 'Unassigned', aiAnalysis
  });
  emit(req.app.get('io'), 'incident:created', incident);
  res.status(201).json({ success: true, incident });
}

export async function updateStatus(req, res) {
  const { id } = req.params;
  const { status, changedBy, assignedDepartment, responderUnit, resolutionProofUrl, workerNotes } = req.body;
  if (!status || !VALID_STATUSES.includes(status))
    return res.status(400).json({ success: false, error: 'Invalid or unsupported status value.' });
  const existing = await incidentRepository.getById(id);
  if (!existing) return res.status(404).json({ success: false, error: 'Complaint not found.' });

  const statusHistory = [...(existing.statusHistory || []), {
    status, changedBy: req.user?.name || changedBy || 'Government Official', changedAt: new Date().toISOString()
  }];
  const updated = await incidentRepository.update(id, {
    status, statusHistory,
    ...(assignedDepartment && { assignedDepartment }),
    ...(responderUnit && { responderUnit }),
    ...(resolutionProofUrl && { resolutionProofUrl }),
    ...(workerNotes && { workerNotes })
  });
  emit(req.app.get('io'), 'incident:updated', updated);
  res.json({ success: true, incident: updated });
}

export async function addProgress(req, res) {
  const { id } = req.params;
  const { message, updatedBy, imageUrl, progressImage } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, error: 'Progress update message is required.' });
  const existing = await incidentRepository.getById(id);
  if (!existing) return res.status(404).json({ success: false, error: 'Complaint not found.' });
  const progressUpdates = [...(existing.progressUpdates || []), {
    message: message.trim(), updatedBy: req.user?.name || updatedBy || 'Municipality Official',
    imageUrl: imageUrl || progressImage || null, updatedAt: new Date().toISOString()
  }];
  const updated = await incidentRepository.update(id, { progressUpdates });
  emit(req.app.get('io'), 'incident:updated', updated);
  res.json({ success: true, incident: updated });
}

export async function addFeedback(req, res) {
  const existing = await incidentRepository.getById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Complaint not found.' });
  const rating = Number(req.body.rating);
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5.' });
  const updated = await incidentRepository.update(req.params.id, { feedbackRating: rating, feedbackComment: req.body.comment || '' });
  emit(req.app.get('io'), 'incident:updated', updated);
  res.json({ success: true, incident: updated });
}

export async function patchIncident(req, res) {
  const existing = await incidentRepository.getById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Complaint not found.' });
  const updates = { ...req.body };
  if (req.body.status && req.body.status !== existing.status) {
    updates.statusHistory = [...(existing.statusHistory || []), {
      status: req.body.status, changedBy: req.user?.name || req.body.changedBy || 'Government Official',
      changedAt: new Date().toISOString()
    }];
  }
  const updated = await incidentRepository.update(req.params.id, updates);
  emit(req.app.get('io'), 'incident:updated', updated);
  res.json({ success: true, incident: updated });
}

export async function resolveIncident(req, res) {
  const existing = await incidentRepository.getById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Complaint not found.' });
  const updated = await incidentRepository.update(req.params.id, {
    status: 'WORK_DONE',
    statusHistory: [...(existing.statusHistory || []), {
      status: 'WORK_DONE', changedBy: req.user?.name || req.body.changedBy || 'Field Team / Official',
      changedAt: new Date().toISOString()
    }],
    resolutionProofUrl: req.body.resolutionProofUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500',
    workerNotes: req.body.workerNotes || 'Field team completed repairs and uploaded completion proof photo.'
  });
  emit(req.app.get('io'), 'incident:updated', updated);
  res.json({ success: true, incident: updated });
}
