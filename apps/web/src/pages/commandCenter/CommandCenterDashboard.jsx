import React from 'react';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard.jsx';
import { GeospatialMap } from '../../components/GeospatialMap.jsx';
import { ComplaintTimeline } from '../../components/ComplaintTimeline.jsx';
import { MunicipalityActionPanel } from '../../components/MunicipalityActionPanel.jsx';
import { Search, Filter, Layers, MessageSquare, Sparkles, MapPin } from 'lucide-react';
import { getSeverityBadgeColor, getStatusBadgeColor, getHumanStatusLabel, formatISTDateTime, formatISTTime } from '@civicai/shared';
import { EvidenceImage } from '../../components/EvidenceImage.jsx';

export function CommandCenterDashboard({ incidents, filteredIncidents, selectedIncident, setSelectedIncident, searchQuery, setSearchQuery, filterCategory, setFilterCategory, filterStatus, setFilterStatus, currentUser, onOpenDispatchModal, setIncidents }) {
  return <div className="mx-auto w-full max-w-[1500px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
    <div className="mb-6">
      <div className="eyebrow">Municipal operations</div>
      <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.7rem] mb-0">Operations overview</h1>
      <p className="mt-1.5 text-sm text-slate-600 mb-0">Monitor incoming civic complaints, field activity and resolution progress.</p>
    </div>
    <AnalyticsDashboard incidents={incidents}/>

    <div className="panel my-5 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_200px]">
      <label className="relative block sm:col-span-2 lg:col-span-1">
        <span className="sr-only">Search complaints</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"/>
        <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search complaints, addresses or complainants..." className="form-input pl-9"/>
      </label>
      <label className="relative block">
        <span className="sr-only">Filter by category</span>
        <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true"/>
        <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="form-select pl-9"><option value="ALL">All categories</option><option value="Pothole & Road Damage">Pothole & Road Damage</option><option value="Municipal/Sanitation">Municipal/Sanitation</option><option value="Water & Sanitation">Water & Sanitation</option><option value="Animal Control & Sanitation">Animal Control & Sanitation</option></select>
      </label>
      <label className="block">
        <span className="sr-only">Filter by status</span>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="form-select"><option value="ALL">All statuses</option><option value="SUBMITTED">Complaint Submitted</option><option value="VERIFIED">Complaint Verified</option><option value="UNDER_PROGRESS">Work Started</option><option value="WORK_IN_ACTION">Work In Progress</option><option value="WORK_COMPLETED">Work Completed</option><option value="RESOLVED">Issue Resolved</option><option value="CLOSED">Complaint Closed</option></select>
      </label>
    </div>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="panel overflow-hidden p-2"><GeospatialMap incidents={filteredIncidents} selectedIncident={selectedIncident} onSelectIncident={setSelectedIncident}/></div>
        {selectedIncident && <div className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2"><span className="badge" style={{'--badge-color':getSeverityBadgeColor(selectedIncident.severity)}}>{selectedIncident.severity}</span><span className="badge" style={{'--badge-color':getStatusBadgeColor(selectedIncident.status)}}>{getHumanStatusLabel(selectedIncident.status)}</span><span className="badge" style={{'--badge-color':'#475569'}}>Urgency {selectedIncident.urgencyScore ?? '—'}/100</span></div>
              <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 mb-0">{selectedIncident.title}</h2>
              <div className="mt-2 flex items-start gap-1.5 text-sm text-slate-600"><MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true"/><span>{selectedIncident.address} · {selectedIncident.assignedDepartment}</span></div>
            </div>
            <button onClick={()=>onOpenDispatchModal(selectedIncident)} className="btn btn-primary btn-sm">Dispatch department</button>
          </div>
          <div className="my-6"><ComplaintTimeline currentStatus={selectedIncident.status} statusHistory={selectedIncident.statusHistory}/></div>
          <MunicipalityActionPanel incident={selectedIncident} currentUser={currentUser} onUpdated={updated=>{setSelectedIncident(updated);setIncidents(prev=>prev.map(i=>i.id===updated.id?updated:i));}}/>
          <p className="mt-5 text-sm leading-7 text-slate-700 mb-0">{selectedIncident.description}</p>
          {selectedIncident.imageUrl && <EvidenceImage src={selectedIncident.imageUrl} alt="Citizen evidence" className="mt-1" maxH="max-h-[270px]" />}
          {selectedIncident.aiAnalysis && <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800"><Sparkles size={16}/> AI assessment</div>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2"><div>Detected issue <strong className="block text-slate-900">{selectedIncident.aiAnalysis.detectedIssue}</strong></div><div>Confidence <strong className="block text-slate-900">{Math.round((selectedIncident.aiAnalysis.confidence||.94)*100)}%</strong></div></div>
            <div className="mt-2 text-sm text-slate-600">Auto-routed to <strong className="text-slate-900">{selectedIncident.assignedDepartment}</strong></div>
          </div>}
          {selectedIncident.progressUpdates?.length>0 && <div className="mt-5"><div className="mb-2.5 flex items-center gap-2 text-sm font-bold text-slate-900"><MessageSquare size={15} className="text-blue-600"/> Progress updates</div>{selectedIncident.progressUpdates.map((up,idx)=><div key={idx} className="mb-2 rounded-r-lg border-l-[3px] border-blue-300 bg-slate-50 px-3.5 py-3"><div className="text-sm text-slate-800">{up.message}</div><div className="mt-1 text-xs text-slate-500">Posted by {up.updatedBy} · {formatISTDateTime(up.updatedAt)}</div></div>)}</div>}
        </div>}
      </div>

      <aside className="panel overflow-hidden p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between"><div><div className="panel-title">Complaints queue</div><div className="mt-0.5 text-xs text-slate-500">Live operational view</div></div><Layers size={18} className="text-blue-600" aria-hidden="true"/></div>
        <div className="max-h-[760px] space-y-2 overflow-y-auto pr-1">{filteredIncidents.length===0?<div className="p-8 text-center text-sm text-slate-500">No complaints match your filters.</div>:filteredIncidents.map(i=>{const selected=selectedIncident?.id===i.id;return <div key={i.id} role="button" tabIndex={0} aria-pressed={selected} onClick={()=>setSelectedIncident(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedIncident(i);}}} className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${selected?'border-blue-400 bg-blue-50':'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}><div className="flex items-center justify-between gap-2"><span className="badge" style={{'--badge-color':getSeverityBadgeColor(i.severity)}}>{i.severity}</span><span className="text-xs text-slate-500">{formatISTTime(i.reportedAt)}</span></div><div className="mt-2.5 text-sm font-semibold text-slate-900">{i.title}</div><div className="mb-2.5 mt-1 text-xs text-slate-600">{i.assignedDepartment}</div><span className="badge" style={{'--badge-color':getStatusBadgeColor(i.status)}}>{getHumanStatusLabel(i.status)}</span></div>})}</div>
      </aside>
    </div>
  </div>;
}
