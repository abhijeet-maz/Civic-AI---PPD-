import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['SUBMITTED', 'AI_ANALYZED', 'VERIFIED', 'ASSIGNED', 'UNDER_PROGRESS', 'WORK_IN_ACTION', 'WORK_COMPLETED', 'WORK_DONE', 'RESOLVED', 'CLOSED', 'Reported', 'Triaged', 'Dispatched', 'In Progress', 'Resolved'], 
    default: 'SUBMITTED' 
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      changedBy: { type: String, default: 'System' },
      changedAt: { type: Date, default: Date.now }
    }
  ],
  progressUpdates: [
    {
      message: { type: String, required: true },
      updatedBy: { type: String, default: 'Municipality Official' },
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  // Complainant Information
  complainant: {
    name: { type: String, default: 'Anonymous Citizen' },
    phone: { type: String, required: true },
    phoneVerified: { type: Boolean, default: false }
  },

  // Media Evidence (Cloudinary Metadata)
  evidence: [
    {
      url: { type: String, required: true },
      publicId: { type: String },
      resourceType: { type: String, default: 'image' },
      format: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],

  // Enriched Location Picker Data
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    placeId: { type: String },
    source: { type: String, enum: ['GPS', 'SEARCH', 'PIN'], default: 'PIN' }
  },

  urgencyScore: { type: Number, default: 50 },
  description: { type: String },
  address: { type: String },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  imageUrl: { type: String },
  resolutionProofUrl: { type: String },
  workerNotes: { type: String },
  assignedDepartment: { type: String, default: 'Road Maintenance' },
  responderUnit: { type: String, default: 'Unassigned' },
  submittedBy: { type: String, default: 'Anonymous Citizen' },
  upvotes: { type: Number, default: 1 },
  feedbackRating: { type: Number, min: 1, max: 5 },
  feedbackComment: { type: String },
  aiAnalysis: {
    detectedIssue: String,
    confidence: Number,
    suggestedPriority: String,
    actionPlan: String
  },
  reportedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

