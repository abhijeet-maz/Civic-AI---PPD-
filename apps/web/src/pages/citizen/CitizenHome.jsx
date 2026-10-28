import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Layers, Sparkles, MessageSquare, Star, MapPin, ArrowRight, ShieldCheck, Clock3, CheckCircle2 } from 'lucide-react';
import { GeospatialMap } from '../../components/GeospatialMap.jsx';
import { ComplaintTimeline } from '../../components/ComplaintTimeline.jsx';
import { getSeverityBadgeColor, getStatusBadgeColor, getHumanStatusLabel, formatISTDateTime, formatISTTime } from '@civicai/shared';
import { EvidenceImage } from '../../components/EvidenceImage.jsx';

export function CitizenHome({ incidents, filteredIncidents, selectedIncident, setSelectedIncident, searchQuery, setSearchQuery, filterCategory, setFilterCategory, filterStatus, setFilterStatus, onOpenReportModal, onOpenFeedbackModal }) {
  const total = incidents.length;
  const resolved = incidents.filter(i => ['RESOLVED','CLOSED','Resolved'].includes(i.status)).length;
  const progress = incidents.filter(i => ['UNDER_PROGRESS','WORK_IN_ACTION','WORK_COMPLETED','WORK_DONE'].includes(i.status)).length;

  return (
    <div className="citizen-page-container mx-auto w-full max-w-[1440px] px-4 pb-12 pt-5 sm:px-6">
      {/* Hero */}
      <section className="panel mb-8 overflow-hidden">
        <div className="grid bg-gradient-to-br from-[#102a56] via-[#174b91] to-blue-600 text-white lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="p-6 sm:p-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
              <ShieldCheck size={14} /> Public civic service
            </div>
            <h1 className="max-w-[650px] font-display text-[clamp(1.9rem,5vw,2.9rem)] font-extrabold leading-[1.1] tracking-tight text-white mb-0">
              Report issues.<br />Improve your city.
            </h1>
            <p className="mb-6 mt-4 max-w-[600px] text-[15px] leading-relaxed text-blue-50">
              CivicAI helps residents report civic problems, track progress and stay informed while municipal teams manage resolution from one platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onOpenReportModal}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-blue-900 shadow-sm transition-colors hover:bg-blue-50 active:bg-blue-100 border-0"
              >
                <Plus size={17} /> Report a civic issue
              </button>
              <a
                href="#track-section"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/20 active:bg-white/25"
              >
                <Search size={16} /> Track a complaint
              </a>
            </div>
          </div>
          <div className="flex items-center p-5 pt-0 sm:p-8 lg:pl-0">
            <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-100">Live service overview</div>
              {[['Reported issues', total, Layers], ['In progress', progress, Clock3], ['Resolved', resolved, CheckCircle2]].map(([label, value, Icon]) => (
                <div key={label} className="flex items-center justify-between border-t border-white/15 py-3">
                  <span className="flex items-center gap-2.5 text-sm text-blue-50"><Icon size={16} aria-hidden="true" />{label}</span>
                  <strong className="text-2xl font-bold tabular-nums text-white">{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="track-section" className="scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="eyebrow">Community issues</div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 mb-0">Track reported complaints</h2>
          </div>
          <div className="shrink-0 text-sm text-slate-600" aria-live="polite">{filteredIncidents.length} issue{filteredIncidents.length === 1 ? '' : 's'} shown</div>
        </div>

        {/* Filters */}
        <div className="panel mb-5 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_200px]">
          <label className="relative block sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Search complaints</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search complaint, title or location..."
              className="form-input pl-9"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Filter by category</span>
            <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="form-select pl-9">
              <option value="ALL">All categories</option>
              <option value="Pothole & Road Damage">Pothole & Road Damage</option>
              <option value="Municipal/Sanitation">Municipal/Sanitation</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Animal Control & Sanitation">Animal Control & Sanitation</option>
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Filter by status</span>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select">
              <option value="ALL">All statuses</option>
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

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="panel overflow-hidden p-2">
              <GeospatialMap incidents={filteredIncidents} selectedIncident={selectedIncident} onSelectIncident={setSelectedIncident} />
            </div>

            {selectedIncident && (
              <div className="panel p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="badge" style={{ '--badge-color': getSeverityBadgeColor(selectedIncident.severity) }}>{selectedIncident.severity}</span>
                      <span className="badge" style={{ '--badge-color': getStatusBadgeColor(selectedIncident.status) }}>{getHumanStatusLabel(selectedIncident.status)}</span>
                    </div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 mb-0">{selectedIncident.title}</h2>
                    <div className="mt-2 flex items-start gap-1.5 text-sm text-slate-600"><MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{selectedIncident.address} · {selectedIncident.assignedDepartment}</span></div>
                  </div>
                  <Link to={`/complaint/${selectedIncident.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-blue-700 no-underline hover:bg-blue-50 hover:text-blue-800">
                    View full timeline <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="my-6"><ComplaintTimeline currentStatus={selectedIncident.status} statusHistory={selectedIncident.statusHistory} /></div>
                <p className="text-sm leading-7 text-slate-700 mt-0 mb-0">{selectedIncident.description}</p>
                {selectedIncident.imageUrl && <EvidenceImage src={selectedIncident.imageUrl} alt="Citizen evidence" className="mt-3" maxH="max-h-64" />}

                {selectedIncident.aiAnalysis && (
                  <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-800"><Sparkles size={16} /> AI assessment</div>
                    <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>Detected issue <strong className="block text-slate-900">{selectedIncident.aiAnalysis.detectedIssue}</strong></div>
                      <div>Confidence <strong className="block text-slate-900">{Math.round((selectedIncident.aiAnalysis.confidence || .94) * 100)}%</strong></div>
                    </div>
                  </div>
                )}

                {selectedIncident.progressUpdates?.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-2.5 flex items-center gap-2 text-sm font-bold text-slate-900"><MessageSquare size={15} className="text-blue-600" /> Progress updates</div>
                    {selectedIncident.progressUpdates.map((up, idx) => (
                      <div key={idx} className="mb-2 rounded-r-lg border-l-[3px] border-blue-300 bg-slate-50 px-3.5 py-3">
                        <div className="text-sm text-slate-800">{up.message}</div>
                        <div className="mt-1 text-xs text-slate-500">Posted by {up.updatedBy} · {formatISTDateTime(up.updatedAt)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {['WORK_COMPLETED','WORK_DONE','RESOLVED','CLOSED','Resolved'].includes(selectedIncident.status) && selectedIncident.resolutionProofUrl && (
                  <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-2 text-sm font-bold text-emerald-800">Completion evidence</div>
                    <EvidenceImage src={selectedIncident.resolutionProofUrl} alt="Resolution proof" maxH="max-h-64" />
                  </div>
                )}

                {['RESOLVED','CLOSED','Resolved'].includes(selectedIncident.status) && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    {selectedIncident.feedbackRating ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-900"><Star size={15} className="fill-amber-500 text-amber-500" /> Rating: {selectedIncident.feedbackRating}/5 {selectedIncident.feedbackComment && <span className="font-normal">· “{selectedIncident.feedbackComment}”</span>}</div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-amber-900">Issue resolved. Share your feedback to help improve civic services.</span>
                        <button onClick={() => onOpenFeedbackModal(selectedIncident)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-400 active:bg-amber-600 border-0"><Star size={14} /> Give feedback</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="panel overflow-hidden p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="panel-title">Recent complaints</div>
                <div className="mt-0.5 text-xs text-slate-500">Select an issue to view details</div>
              </div>
              <Layers size={18} className="text-blue-600" aria-hidden="true" />
            </div>
            <div className="max-h-[760px] space-y-2 overflow-y-auto pr-1">
              {filteredIncidents.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No complaints match your filters.</div>
              ) : filteredIncidents.map(incident => {
                const selected = selectedIncident?.id === incident.id;
                return (
                  <div
                    key={incident.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    onClick={() => setSelectedIncident(incident)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedIncident(incident); } }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${selected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge" style={{ '--badge-color': getSeverityBadgeColor(incident.severity) }}>{incident.severity}</span>
                      <span className="text-xs text-slate-500">{formatISTTime(incident.reportedAt)}</span>
                    </div>
                    <div className="mt-2.5 text-sm font-semibold text-slate-900">{incident.title}</div>
                    <div className="mb-2.5 mt-1 text-xs text-slate-600">{incident.assignedDepartment}</div>
                    <span className="badge" style={{ '--badge-color': getStatusBadgeColor(incident.status) }}>{getHumanStatusLabel(incident.status)}</span>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
