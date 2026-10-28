import mongoose from 'mongoose';
import { Incident } from '../models/Incident.js';
import { initialIncidents } from './seedData.js';

class IncidentRepository {
  constructor() {
    this.memoryIncidents = [...initialIncidents];
  }

  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  async getAll(filters = {}) {
    let items;
    if (this.isMongoConnected()) {
      try {
        items = (await Incident.find().sort({ reportedAt: -1 })).map(d => d.toObject());
      } catch (err) {
        console.error('MongoDB find error:', err);
      }
    }
    items = items || [...this.memoryIncidents];

    return items.filter(i =>
      (!filters.status || i.status === filters.status) &&
      (!filters.severity || i.severity === filters.severity) &&
      (!filters.category || i.category === filters.category) &&
      (!filters.department || i.assignedDepartment === filters.department) &&
      (!filters.assignedWorker || i.assignedWorker === filters.assignedWorker || i.responderUnit === filters.assignedWorker)
    );
  }

  async getById(id) {
    if (this.isMongoConnected()) {
      try {
        const doc = await Incident.findOne({ id });
        if (doc) return doc.toObject();
      } catch (err) {
        console.error('MongoDB getById error:', err);
      }
    }
    return this.memoryIncidents.find(i => i.id === id) || null;
  }

  async add(data) {
    const totalCount = (await this.getAll()).length + 1;
    const nextId = `INC-2026-${String(totalCount).padStart(3, '0')}-${Math.floor(100 + Math.random() * 900)}`;
    const incident = {
      id: nextId,
      upvotes: 1,
      reportedAt: new Date().toISOString(),
      status: 'Reported',
      assignedDepartment: data.assignedDepartment || 'Road Maintenance',
      responderUnit: 'Unassigned',
      ...data
    };

    if (this.isMongoConnected()) {
      try {
        const doc = await new Incident(incident).save();
        return doc.toObject();
      } catch (err) {
        console.error('MongoDB save error:', err);
      }
    }
    this.memoryIncidents.unshift(incident);
    return incident;
  }

  async update(id, updates) {
    if (this.isMongoConnected()) {
      try {
        const updated = await Incident.findOneAndUpdate(
          { id }, { $set: updates }, { returnDocument: 'after' }
        );
        if (updated) return updated.toObject();
      } catch (err) {
        console.error('MongoDB update error:', err);
      }
    }
    const idx = this.memoryIncidents.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.memoryIncidents[idx] = { ...this.memoryIncidents[idx], ...updates };
    return this.memoryIncidents[idx];
  }
}

export const incidentRepository = new IncidentRepository();
