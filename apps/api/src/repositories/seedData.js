export const initialIncidents = [
  {
    id: 'INC-2026-001',
    title: 'Major Water Main Pipe Burst',
    category: 'Water Main & Pipe Leak',
    severity: 'Critical',
    status: 'Dispatched',
    urgencyScore: 94,
    description: 'High pressure water pipe ruptured under main intersection, causing local street flooding and asphalt degradation.',
    address: '424 Innovation Boulevard, Central Metro',
    lat: 37.7749,
    lng: -122.4194,
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    assignedDepartment: 'Water & Waste Management',
    responderUnit: 'Unit W-402',
    upvotes: 18,
    aiAnalysis: {
      detectedIssue: 'Pressurized Pipe Fracture',
      confidence: 0.96,
      suggestedPriority: 'Critical',
      actionPlan: 'Isolate main valve grid sector 4; dispatch heavy excavators and emergency pipe repair squad.'
    }
  },
  {
    id: 'INC-2026-002',
    title: 'Dangerous Pothole Cluster on Hwy 101 On-Ramp',
    category: 'Pothole & Road Damage',
    severity: 'High',
    status: 'Triaged',
    urgencyScore: 78,
    description: 'Multiple deep potholes measuring over 12 inches across reported causing severe tire punctures during peak traffic hours.',
    address: 'Exit 14B Hwy 101 Access Corridor',
    lat: 37.7833,
    lng: -122.4167,
    reportedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    assignedDepartment: 'Dept of Transportation & Public Works',
    responderUnit: 'Unassigned',
    upvotes: 34,
    aiAnalysis: {
      detectedIssue: 'Structural Asphalt Degradation',
      confidence: 0.91,
      suggestedPriority: 'High',
      actionPlan: 'Deploy cold patch asphalt repair truck and temporary warning cones.'
    }
  },
  {
    id: 'INC-2026-003',
    title: 'Traffic Signal Blackout at 5th & Mission',
    category: 'Traffic Signal Malfunction',
    severity: 'Critical',
    status: 'In Progress',
    urgencyScore: 98,
    description: 'All 4 traffic lights dark following localized transformer trip. Police unit on scene directing manual traffic flow.',
    address: '5th Street & Mission Street Intersection',
    lat: 37.7818,
    lng: -122.4062,
    reportedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    assignedDepartment: 'Emergency First Response',
    responderUnit: 'Unit Traffic-12',
    upvotes: 42,
    aiAnalysis: {
      detectedIssue: 'Control Panel Electrical Fault',
      confidence: 0.98,
      suggestedPriority: 'Critical',
      actionPlan: 'Deploy portable generator unit and dispatch traffic signal technicians.'
    }
  },
  {
    id: 'INC-2026-004',
    title: 'Overflowing Commercial Waste Dumpsters',
    category: 'Sanitation & Waste Overflow',
    severity: 'Medium',
    status: 'Reported',
    urgencyScore: 54,
    description: 'Waste dumpsters overflowing into pedestrian sidewalk, blocking accessibility and attracting urban wildlife.',
    address: '890 Market Street Plaza',
    lat: 37.7851,
    lng: -122.4075,
    reportedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    assignedDepartment: 'Water & Waste Management',
    responderUnit: 'Unassigned',
    upvotes: 8,
    aiAnalysis: {
      detectedIssue: 'Waste Management Overflow',
      confidence: 0.88,
      suggestedPriority: 'Medium',
      actionPlan: 'Schedule priority sanitation pickup route dispatch within 4 hours.'
    }
  },
  {
    id: 'INC-2026-005',
    title: 'Streetlight Failure along Riverfront Parkway',
    category: 'Street Light Failure',
    severity: 'Low',
    status: 'Resolved',
    urgencyScore: 28,
    description: 'Sequential lamp posts dark along 300-meter pedestrian walkway.',
    address: 'Riverfront Parkway Pier 14',
    lat: 37.7915,
    lng: -122.3910,
    reportedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    assignedDepartment: 'Municipal Power Authority',
    responderUnit: 'Unit Light-03',
    upvotes: 5,
    aiAnalysis: {
      detectedIssue: 'Photocell Sensor Failure',
      confidence: 0.89,
      suggestedPriority: 'Low',
      actionPlan: 'Replaced failed photocell module and restored power.'
    }
  }
];

