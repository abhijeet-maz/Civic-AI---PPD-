import { useCallback, useEffect, useMemo, useState } from 'react';
import { incidentModel } from '../models/incidentModel.js';
import { connectCivicSocket } from '../services/socketService.js';

export function useIncidentController() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [socketStatus, setSocketStatus] = useState('Connecting...');

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await incidentModel.list();
      setIncidents(data);
      setSelectedIncident(prev => prev ? data.find(i => i.id === prev.id) || prev : data[0] || null);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    return connectCivicSocket({
      onConnect: () => { setSocketStatus('🟢 Live Socket Connected'); fetchIncidents(); },
      onDisconnect: () => setSocketStatus('🟡 Reconnecting...'),
      onIncidentCreated: incident => setIncidents(prev => [incident, ...prev]),
      onIncidentUpdated: incident => {
        setIncidents(prev => prev.map(i => i.id === incident.id ? incident : i));
        setSelectedIncident(prev => prev?.id === incident.id ? incident : prev);
      }
    });
  }, [fetchIncidents]);

  const filteredIncidents = useMemo(() => incidents.filter(i => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      i.id?.toLowerCase().includes(q) ||
      i.title?.toLowerCase().includes(q) ||
      i.address?.toLowerCase().includes(q) ||
      i.submittedBy?.toLowerCase().includes(q);
    return matchesSearch &&
      (filterCategory === 'ALL' || i.category === filterCategory) &&
      (filterStatus === 'ALL' || i.status === filterStatus);
  }), [incidents, searchQuery, filterCategory, filterStatus]);

  return {
    incidents, setIncidents, selectedIncident, setSelectedIncident,
    filteredIncidents, searchQuery, setSearchQuery,
    filterCategory, setFilterCategory, filterStatus, setFilterStatus,
    socketStatus, refreshIncidents: fetchIncidents
  };
}
