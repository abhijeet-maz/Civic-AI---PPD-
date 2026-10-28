import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

// Layouts
import { CitizenLayout } from './layouts/CitizenLayout.jsx';
import { CommandCenterLayout } from './layouts/CommandCenterLayout.jsx';

// Citizen Pages
import { CitizenHome } from './pages/citizen/CitizenHome.jsx';
import { CitizenComplaintDetail } from './pages/citizen/CitizenComplaintDetail.jsx';

// Command Center Pages
import { CommandCenterLogin } from './pages/commandCenter/CommandCenterLogin.jsx';
import { CommandCenterRegister } from './pages/commandCenter/CommandCenterRegister.jsx';
import { CommandCenterDashboard } from './pages/commandCenter/CommandCenterDashboard.jsx';
import { CommandCenterComplaints } from './pages/commandCenter/CommandCenterComplaints.jsx';
import { CommandCenterMap } from './pages/commandCenter/CommandCenterMap.jsx';
import { CommandCenterAnalytics } from './pages/commandCenter/CommandCenterAnalytics.jsx';

// Shared Modals
import { IncidentFormModal } from './components/IncidentFormModal.jsx';
import { DispatchModal } from './components/DispatchModal.jsx';
import { FeedbackModal } from './components/FeedbackModal.jsx';
import { NotificationsModal } from './components/NotificationsModal.jsx';
import { AiAssistantModal } from './components/AiAssistantModal.jsx';

import { getHumanStatusLabel, formatISTDateTime } from '@civicai/shared';

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dispatchIncident, setDispatchIncident] = useState(null);
  const [feedbackIncident, setFeedbackIncident] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAiAssistantModal, setShowAiAssistantModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civicai_user');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : { name: 'Public Citizen', role: 'Citizen' };
    } catch (err) {
      return { name: 'Public Citizen', role: 'Citizen' };
    }
  });

  const [socketStatus, setSocketStatus] = useState('Connecting...');

  const fetchIncidents = async () => {
    try {
      const res = await axios.get('/api/incidents');
      if (res.data.success) {
        setIncidents(res.data.incidents);
        setSelectedIncident(prev => {
          if (!prev) return res.data.incidents[0] || null;
          const match = res.data.incidents.find(i => i.id === prev.id);
          return match || prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();

    const socket = io('/', { transports: ['websocket', 'polling'] });
    
    socket.on('connect', () => {
      setSocketStatus('🟢 Live Socket Connected');
      fetchIncidents();
    });

    socket.on('disconnect', () => {
      setSocketStatus('🟡 Reconnecting...');
    });

    socket.on('incident:created', (newInc) => {
      setIncidents(prev => [newInc, ...prev]);
    });

    socket.on('incident:updated', (updatedInc) => {
      setIncidents(prev => prev.map(i => i.id === updatedInc.id ? updatedInc : i));
      setSelectedIncident(prev => prev?.id === updatedInc.id ? updatedInc : prev);
    });

    return () => socket.disconnect();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('civicai_user', JSON.stringify(user));
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('civicai_token');
    localStorage.removeItem('civicai_user');
    setCurrentUser({ name: 'Public Citizen', role: 'Citizen' });
  };

  const handleExportCSV = () => {
    if (!incidents.length) return;
    const headers = ['Complaint ID', 'Title', 'Category', 'Severity', 'Department', 'Status', 'Submitted By', 'Reported Date IST'];
    const rows = incidents.map(i => [
      i.id,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.category,
      i.severity,
      i.assignedDepartment,
      getHumanStatusLabel(i.status),
      i.submittedBy,
      formatISTDateTime(i.reportedAt)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicAI_Incidents_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter incidents based on search & dropdowns
  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = !searchQuery || 
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.submittedBy && i.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === 'ALL' || i.category === filterCategory;
    const matchesStat = filterStatus === 'ALL' || i.status === filterStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* Public Citizen Portal Routes */}
          <Route
            element={
              <CitizenLayout
                socketStatus={socketStatus}
                onOpenReportModal={() => setShowReportModal(true)}
                onOpenAiAssistantModal={() => setShowAiAssistantModal(true)}
              />
            }
          >
            <Route
              path="/"
              element={
                <CitizenHome
                  incidents={incidents}
                  filteredIncidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  setSelectedIncident={setSelectedIncident}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  onOpenReportModal={() => setShowReportModal(true)}
                  onOpenFeedbackModal={setFeedbackIncident}
                />
              }
            />
            <Route
              path="/report"
              element={
                <CitizenHome
                  incidents={incidents}
                  filteredIncidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  setSelectedIncident={setSelectedIncident}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  onOpenReportModal={() => setShowReportModal(true)}
                  onOpenFeedbackModal={setFeedbackIncident}
                />
              }
            />
            <Route
              path="/track"
              element={
                <CitizenHome
                  incidents={incidents}
                  filteredIncidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  setSelectedIncident={setSelectedIncident}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  onOpenReportModal={() => setShowReportModal(true)}
                  onOpenFeedbackModal={setFeedbackIncident}
                />
              }
            />
            <Route
              path="/complaint/:id"
              element={
                <CitizenComplaintDetail
                  incidents={incidents}
                  onOpenFeedbackModal={setFeedbackIncident}
                />
              }
            />
          </Route>

          {/* Standalone Authentication Routes */}
          <Route
            path="/command-center/login"
            element={<CommandCenterLogin onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/command-center/register"
            element={<CommandCenterRegister onLoginSuccess={handleLoginSuccess} />}
          />

          {/* Protected Command Center Routes */}
          <Route
            path="/command-center"
            element={
              <CommandCenterLayout
                currentUser={currentUser}
                socketStatus={socketStatus}
                onLogout={handleLogout}
                onExportCSV={handleExportCSV}
                onOpenAiAssistantModal={() => setShowAiAssistantModal(true)}
                onOpenNotificationsModal={() => setShowNotificationsModal(true)}
              />
            }
          >
            <Route index element={<Navigate to="/command-center/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <CommandCenterDashboard
                  incidents={incidents}
                  filteredIncidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  setSelectedIncident={setSelectedIncident}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  currentUser={currentUser}
                  onOpenDispatchModal={setDispatchIncident}
                  setIncidents={setIncidents}
                />
              }
            />
            <Route
              path="complaints"
              element={
                <CommandCenterComplaints
                  incidents={incidents}
                  filteredIncidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  setSelectedIncident={setSelectedIncident}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  currentUser={currentUser}
                  onOpenDispatchModal={setDispatchIncident}
                  setIncidents={setIncidents}
                />
              }
            />
            <Route
              path="complaints/:id"
              element={
                <CommandCenterComplaints
                  incidents={incidents}
                  filteredIncidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  setSelectedIncident={setSelectedIncident}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  currentUser={currentUser}
                  onOpenDispatchModal={setDispatchIncident}
                  setIncidents={setIncidents}
                />
              }
            />
            <Route
              path="map"
              element={
                <CommandCenterMap
                  incidents={incidents}
                  selectedIncident={selectedIncident}
                  setSelectedIncident={setSelectedIncident}
                />
              }
            />
            <Route
              path="analytics"
              element={
                <CommandCenterAnalytics incidents={incidents} />
              }
            />
          </Route>

          {/* Catch-all Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Shared Modals */}
        {showReportModal && (
          <IncidentFormModal
            onClose={() => setShowReportModal(false)}
            onCreated={(newInc) => setSelectedIncident(newInc)}
          />
        )}

        {dispatchIncident && (
          <DispatchModal
            incident={dispatchIncident}
            onClose={() => setDispatchIncident(null)}
            onUpdated={(updated) => setSelectedIncident(updated)}
          />
        )}

        {feedbackIncident && (
          <FeedbackModal
            incident={feedbackIncident}
            onClose={() => setFeedbackIncident(null)}
            onUpdated={(updated) => setSelectedIncident(updated)}
          />
        )}

        <NotificationsModal
          isOpen={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
          incidents={incidents}
        />

        <AiAssistantModal
          isOpen={showAiAssistantModal}
          onClose={() => setShowAiAssistantModal(false)}
          incidents={incidents}
        />
      </div>
    </BrowserRouter>
  );
}
