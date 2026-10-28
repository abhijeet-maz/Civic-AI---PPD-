import React from 'react';
import { useParams } from 'react-router-dom';
import { MunicipalityActionPanel } from '../../components/MunicipalityActionPanel.jsx';
import { ComplaintTimeline } from '../../components/ComplaintTimeline.jsx';
import { Search, Filter, Layers, MessageSquare, Sparkles } from 'lucide-react';
import { getSeverityBadgeColor, getStatusBadgeColor, getHumanStatusLabel, formatISTDateTime, formatISTTime } from '@civicai/shared';
import { EvidenceImage } from '../../components/EvidenceImage.jsx';

export function CommandCenterComplaints({
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
  onOpenDispatchModal,
  setIncidents
}) {
  const { id } = useParams();
  
  React.useEffect(() => {
    if (id) {
      const match = incidents.find(i => i.id === id || i.id?.toLowerCase() === id?.toLowerCase());
      if (match) setSelectedIncident(match);
    }
  }, [id, incidents]);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-5 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div>
        <div className="eyebrow">Case management</div>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900 mb-0">
          Municipal Complaints Management Queue
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 mb-0">
          Review, verify, assign departments, and dispatch maintenance crews to open civic complaints.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="panel grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search complaints</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            className="form-input pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search complaint ID, title, or complainant..."
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-700">
            <Filter size={14} aria-hidden="true" /> Category:
          </span>
          <select
            className="form-select min-w-0 flex-1 lg:w-52"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Pothole & Road Damage">Pothole & Road Damage</option>
            <option value="Municipal/Sanitation">Municipal/Sanitation</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Animal Control & Sanitation">Animal Control & Sanitation</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="shrink-0 text-sm font-medium text-slate-700">Status:</span>
          <select
            className="form-select min-w-0 flex-1 lg:w-48"
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
        </label>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,.8fr)]">
        {/* Selected Complaint Detail & Operational Actions */}
        <div className="flex min-w-0 flex-col gap-5">
          {selectedIncident ? (
            <div className="panel p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="badge" style={{ '--badge-color': getSeverityBadgeColor(selectedIncident.severity) }}>
                      {selectedIncident.severity}
                    </span>
                    <span className="badge" style={{ '--badge-color': getStatusBadgeColor(selectedIncident.status) }}>
                      {getHumanStatusLabel(selectedIncident.status)}
                    </span>
                    <span className="badge" style={{ '--badge-color': '#475569' }}>
                      Urgency Score: {selectedIncident.urgencyScore}/100
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl mb-0">
                    {selectedIncident.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-600 mb-0">
                    📍 {selectedIncident.address} • Department: <strong className="text-slate-900">{selectedIncident.assignedDepartment}</strong>
                  </p>
                </div>

                <button
                  className="btn btn-primary btn-sm"
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

              {/* Operational Action Panel */}
              <MunicipalityActionPanel
                incident={selectedIncident}
                currentUser={currentUser}
                onUpdated={(updated) => {
                  setSelectedIncident(updated);
                  setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
                }}
              />

              <p className="mb-5 mt-5 text-[15px] leading-7 text-slate-700">
                {selectedIncident.description}
              </p>

              {/* Evidence Photograph */}
              {selectedIncident.imageUrl && (
                <div className="mb-5">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Citizen submitted evidence photo
                  </div>
                  <EvidenceImage src={selectedIncident.imageUrl} alt="Citizen evidence" maxH="max-h-[280px]" />
                </div>
              )}

              {/* Progress Log */}
              {selectedIncident.progressUpdates && selectedIncident.progressUpdates.length > 0 && (
                <div className="mb-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 font-bold text-slate-900">
                    <MessageSquare size={16} className="text-blue-600" /> Municipality Progress Updates ({selectedIncident.progressUpdates.length})
                  </div>
                  <div className="grid gap-2">
                    {selectedIncident.progressUpdates.map((up, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 border-l-[3px] border-l-blue-400 bg-white px-3.5 py-2.5 text-sm">
                        <div className="text-slate-800">{up.message}</div>
                        {up.imageUrl && (
                          <EvidenceImage src={up.imageUrl} alt="Progress update photo" className="mt-2" maxH="max-h-32" />
                        )}
                        <div className="mt-1 text-xs text-slate-500">
                          Posted by {up.updatedBy} • {formatISTDateTime(up.updatedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="panel px-4 py-12 text-center text-sm text-slate-600">
              Select a complaint from the queue to view workspace details.
            </div>
          )}
        </div>

        {/* Complaints Queue List */}
        <div className="panel flex max-h-[900px] flex-col p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900 mb-0">
              <Layers size={18} className="text-blue-600" aria-hidden="true" />
              Complaints Queue ({filteredIncidents.length})
            </h3>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1">
            {filteredIncidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              return (
                <div
                  key={incident.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                  onClick={() => setSelectedIncident(incident)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedIncident(incident); } }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="badge" style={{ '--badge-color': getSeverityBadgeColor(incident.severity) }}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatISTTime(incident.reportedAt)}
                    </span>
                  </div>

                  <div className="mb-1 text-[15px] font-semibold text-slate-900">
                    {incident.title}
                  </div>

                  <div className="mb-2.5 text-[13px] text-slate-600">
                    🏢 {incident.assignedDepartment}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="badge" style={{ '--badge-color': getStatusBadgeColor(incident.status) }}>
                      {getHumanStatusLabel(incident.status)}
                    </span>
                    <span className="text-xs font-semibold text-blue-700">
                      {incident.submittedBy}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
