export function calculateUrgencyScore(severity, votes = 1, ageInHours = 0) {
  const baseScores = { Low: 25, Medium: 50, High: 75, Critical: 95 };
  const score = (baseScores[severity] || 30) + Math.min(votes * 5, 20) + Math.min(ageInHours * 2, 10);
  return Math.min(Math.round(score), 100);
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function getStatusBadgeColor(status) {
  switch (status) {
    case 'SUBMITTED':
    case 'Reported': return '#9ca3af';
    case 'AI_ANALYZED':
    case 'Triaged': return '#06b6d4';
    case 'VERIFIED': return '#3b82f6';
    case 'ASSIGNED':
    case 'Dispatched': return '#8b5cf6';
    case 'UNDER_PROGRESS':
    case 'In Progress': return '#f59e0b';
    case 'WORK_IN_ACTION': return '#d97706';
    case 'WORK_COMPLETED':
    case 'WORK_DONE': return '#ec4899';
    case 'RESOLVED':
    case 'Resolved': return '#10b981';
    case 'CLOSED': return '#4b5563';
    default: return '#6b7280';
  }
}

export function getSeverityBadgeColor(severity) {
  switch (severity) {
    case 'Low': return '#10b981';
    case 'Medium': return '#f59e0b';
    case 'High': return '#f97316';
    case 'Critical': return '#ef4444';
    default: return '#6b7280';
  }
}

export const HUMAN_STATUS_LABELS = {
  'SUBMITTED': 'Complaint Submitted',
  'Reported': 'Complaint Submitted',
  'AI_ANALYZED': 'AI Analysis Completed',
  'Triaged': 'AI Analysis Completed',
  'VERIFIED': 'Complaint Verified',
  'ASSIGNED': 'Department Assigned',
  'Dispatched': 'Department Assigned',
  'UNDER_PROGRESS': 'Work Started',
  'In Progress': 'Work Started',
  'WORK_IN_ACTION': 'Work In Progress',
  'WORK_COMPLETED': 'Work Completed',
  'WORK_DONE': 'Work Completed',
  'RESOLVED': 'Issue Resolved',
  'Resolved': 'Issue Resolved',
  'CLOSED': 'Complaint Closed'
};

export function getHumanStatusLabel(status) {
  return HUMAN_STATUS_LABELS[status] || status || 'Complaint Logged';
}

export function formatISTDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d) + ' IST';
}

export function formatISTTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d) + ' IST';
}

export function formatISTDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
}
