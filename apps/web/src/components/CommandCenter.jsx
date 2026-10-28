import React from 'react';
import { Shield, Sparkles, LogOut, Download, Search, Filter, Layers, MessageSquare, Star, UserCheck, Bell, Building2 } from 'lucide-react';
import { GeospatialMap } from './GeospatialMap.jsx';
import { AnalyticsDashboard } from './AnalyticsDashboard.jsx';
import { ComplaintTimeline } from './ComplaintTimeline.jsx';
import { MunicipalityActionPanel } from './MunicipalityActionPanel.jsx';
import { getSeverityBadgeColor, getStatusBadgeColor, getHumanStatusLabel, formatISTDateTime, formatISTTime } from '@civicai/shared';

export function CommandCenter({
  incidents,
  filteredIncidents,
  selectedIncident,
  setSelectedIncident,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  currentUser,
  socketStatus,
  onLogout,
  onExportCSV,
  onOpenDispatchModal,
  onOpenAiAssistantModal,
  onOpenNotificationsModal,
  onSwitchPortal,
  setIncidents
}) {
  return (
    <div className="command-center-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Command Center Navigation Header */}
      <header className="header" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))', borderBottom: '1px solid var(--accent-purple)', padding: '0.85rem 2rem' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-logo" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', padding: '0.5rem', borderRadius: '10px' }}>
            <Building2 size={22} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title" style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>CivicAI Command Center</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: 700, letterSpacing: '0.5px' }}>
              MUNICIPAL OPERATIONAL MANAGEMENT WORKSPACE • Logged in as: <span style={{ color: '#fff' }}>{currentUser.name}</span> ({currentUser.role})
            </div>
          </div>
        </div>

        {/* Live Socket Status */}
        <div style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontWeight: 600 }}>
          {socketStatus}
        </div>

        {/* Operational Actions & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => onSwitchPortal('CITIZEN_PORTAL')}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '0.55rem 0.85rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UserCheck size={16} color="var(--accent-cyan)" /> Switch to Citizen Portal
          </button>

          <button
            onClick={onOpenAiAssistantModal}
            style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid var(--accent-purple)', color: '#fff', padding: '0.55rem 0.85rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={16} color="var(--accent-purple)" /> AI Assistant
          </button>

          <button
            onClick={onOpenNotificationsModal}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.55rem 0.85rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Bell size={16} color="var(--accent-blue)" /> Notifications
          </button>

          <button
            onClick={onExportCSV}
            style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: '#fff', padding: '0.55rem 0.85rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={16} color="var(--accent-emerald)" /> Export CSV
          </button>

          <button
            onClick={onLogout}
            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', color: '#f87171', padding: '0.55rem 0.85rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div style={{ background: 'rgba(18, 24, 38, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '260px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.4rem 0.75rem' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search complaint ID, title, address, or complainant..."
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Filter size={14} /> Category:
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Pothole & Road Damage">Pothole & Road Damage</option>
            <option value="Municipal/Sanitation">Municipal/Sanitation</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Animal Control & Sanitation">Animal Control & Sanitation</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Status:
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Complaint Submitted</option>
            <option value="VERIFIED">Complaint Verified</option>
            <option value="UNDER_PROGRESS">Work Started</option>
            <option value="WORK_IN_ACTION">Work In Progress</option>
            <option value="WORK_COMPLETED">Work Completed</option>
            <option value="RESOLVED">Issue Resolved</option>
            <option value="CLOSED">Complaint Closed</option>
          </select>
        </div>
      </div>

      {/* Main Command Center Content */}
      <main className="main-content" style={{ flex: 1, padding: '1.5rem 2rem' }}>
        {/* Command Center Municipal Analytics Dashboard */}
        <AnalyticsDashboard incidents={incidents} />

        <div className="grid-dashboard" style={{ marginTop: '1.5rem' }}>
          {/* Left Column: Interactive Map & Operational Workspace Pane */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <GeospatialMap
              incidents={filteredIncidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
            />

            {/* Selected Incident Operational Workspace */}
            {selectedIncident && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span className="badge" style={{ background: getSeverityBadgeColor(selectedIncident.severity) }}>
                        {selectedIncident.severity}
                      </span>
                      <span className="badge" style={{ background: getStatusBadgeColor(selectedIncident.status) }}>
                        {getHumanStatusLabel(selectedIncident.status)}
                      </span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--accent-cyan)' }}>
                        Urgency Score: {selectedIncident.urgencyScore}/100
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
                      {selectedIncident.title}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      📍 {selectedIncident.address} • Department: <strong style={{ color: 'var(--accent-purple)' }}>{selectedIncident.assignedDepartment}</strong>
                    </p>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    onClick={() => onOpenDispatchModal(selectedIncident)}
                  >
                    Department Dispatch Modal
                  </button>
                </div>

                {/* 9-Stage Timeline */}
                <ComplaintTimeline
                  currentStatus={selectedIncident.status}
                  statusHistory={selectedIncident.statusHistory}
                />

                {/* Operational Action Panel (Verify, Work Progress, Resolution & Closure) */}
                <MunicipalityActionPanel
                  incident={selectedIncident}
                  currentUser={currentUser}
                  onUpdated={(updated) => {
                    setSelectedIncident(updated);
                    setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
                  }}
                />

                <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  {selectedIncident.description}
                </p>

                {/* Evidence Photograph */}
                {selectedIncident.imageUrl && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      CITIZEN SUBMITTED EVIDENCE PHOTO
                    </div>
                    <img
                      src={selectedIncident.imageUrl}
                      alt="Citizen evidence"
                      style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                )}

                {/* AI Analysis Diagnostic Card */}
                {selectedIncident.aiAnalysis && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(139, 92, 246, 0.08))',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    borderRadius: '12px',
                    padding: '1.2rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                      <Sparkles size={18} />
                      CivicAI Computer Vision Diagnostic Summary
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div>Detected Issue: <strong>{selectedIncident.aiAnalysis.detectedIssue}</strong></div>
                      <div>Model Confidence: <strong>{Math.round((selectedIncident.aiAnalysis.confidence || 0.94) * 100)}%</strong></div>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#e5e7eb' }}>
                      <strong>Auto-Routed Department:</strong> {selectedIncident.assignedDepartment}
                    </div>
                  </div>
                )}

                {/* Municipality Progress Updates Log */}
                {selectedIncident.progressUpdates && selectedIncident.progressUpdates.length > 0 && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MessageSquare size={16} /> Municipality Progress Updates ({selectedIncident.progressUpdates.length})
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {selectedIncident.progressUpdates.map((up, idx) => (
                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <div style={{ color: '#f3f4f6' }}>{up.message}</div>
                          {up.imageUrl && (
                            <img src={up.imageUrl} alt="Progress update photo" style={{ maxHeight: '120px', borderRadius: '6px', marginTop: '0.4rem', objectFit: 'cover' }} />
                          )}
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Posted by {up.updatedBy} • {formatISTDateTime(up.updatedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion Proof */}
                {(selectedIncident.status === 'WORK_COMPLETED' || selectedIncident.status === 'WORK_DONE' || selectedIncident.status === 'RESOLVED' || selectedIncident.status === 'CLOSED' || selectedIncident.status === 'Resolved') && selectedIncident.resolutionProofUrl && (
                  <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                      ✅ Municipality Completion Evidence
                    </div>
                    <img
                      src={selectedIncident.resolutionProofUrl}
                      alt="Resolution proof"
                      style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    {selectedIncident.workerNotes && (
                      <p style={{ fontSize: '0.85rem', color: '#e5e7eb', marginTop: '0.5rem' }}>
                        Completion Note: {selectedIncident.workerNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Citizen Rating Feedback View */}
                {selectedIncident.feedbackRating && (
                  <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Star size={16} fill="var(--accent-amber)" /> Citizen Feedback Rating: {selectedIncident.feedbackRating} / 5 Stars
                    </div>
                    {selectedIncident.feedbackComment && (
                      <div style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>"{selectedIncident.feedbackComment}"</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Command Center Complaints Management Queue */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', maxHeight: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--accent-purple)" />
                Operational Complaints Queue ({filteredIncidents.length})
              </h3>
            </div>

            <div style={{ overflowY: 'auto', paddingRight: '4px' }}>
              {filteredIncidents.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No complaints match your search query or filters.
                </div>
              ) : (
                filteredIncidents.map((incident) => {
                  const isSelected = selectedIncident?.id === incident.id;
                  return (
                    <div
                      key={incident.id}
                      className="incident-card"
                      style={{
                        borderColor: isSelected ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)',
                        background: isSelected ? 'rgba(139, 92, 246, 0.12)' : undefined,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span className="badge" style={{ background: getSeverityBadgeColor(incident.severity) }}>
                          {incident.severity}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatISTTime(incident.reportedAt)}
                        </span>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                        {incident.title}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                        🏢 {incident.assignedDepartment}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                        <span className="badge" style={{ background: getStatusBadgeColor(incident.status) }}>
                          {getHumanStatusLabel(incident.status)}
                        </span>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          {incident.submittedBy}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
