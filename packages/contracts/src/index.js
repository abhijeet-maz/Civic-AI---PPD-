export const INCIDENT_CATEGORIES = {
  POTHOLE: 'Pothole & Road Damage',
  WATER_BREAK: 'Water Main & Pipe Leak',
  TRAFFIC_LIGHT: 'Traffic Signal Malfunction',
  POWER_OUTAGE: 'Power Grid Failure',
  WASTE_OVERFLOW: 'Sanitation & Waste Overflow',
  HAZARDOUS_SPILL: 'Hazardous Chemical Spill',
  STREET_LIGHTING: 'Street Light Failure',
  FLOODING: 'Urban Drainage Flooding',
  DEAD_ANIMAL: 'Dead Animal Road Removal'
};

export const SEVERITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

export const INCIDENT_STATUS = {
  SUBMITTED: 'SUBMITTED',
  AI_ANALYZED: 'AI_ANALYZED',
  VERIFIED: 'VERIFIED',
  ASSIGNED: 'ASSIGNED',
  UNDER_PROGRESS: 'UNDER_PROGRESS',
  WORK_DONE: 'WORK_DONE',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

export const SOCKET_EVENTS = {
  INCIDENT_CREATED: 'incident:created',
  INCIDENT_UPDATED: 'incident:updated',
  INCIDENT_DISPATCHED: 'incident:dispatched',
  TELEMETRY_UPDATE: 'telemetry:update'
};

export const DEPARTMENTS = {
  ROAD_MAINTENANCE: 'Road Maintenance',
  MUNICIPAL_SANITATION: 'Municipal/Sanitation',
  WATER_SANITATION: 'Water & Sanitation',
  ANIMAL_CONTROL: 'Animal Control & Sanitation',
  EMERGENCY_SERVICES: 'Emergency First Response'
};
