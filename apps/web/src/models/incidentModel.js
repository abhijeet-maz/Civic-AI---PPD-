import axios from 'axios';

export const incidentModel = {
  async list(filters = {}) {
    const { data } = await axios.get('/api/incidents', { params: filters });
    return data.incidents || [];
  },
  async create(payload) {
    const { data } = await axios.post('/api/incidents', payload);
    return data.incident;
  },
  async update(id, payload) {
    const { data } = await axios.patch(`/api/incidents/${id}`, payload);
    return data.incident;
  },
  async updateStatus(id, payload) {
    const { data } = await axios.patch(`/api/incidents/${id}/status`, payload);
    return data.incident;
  }
};
