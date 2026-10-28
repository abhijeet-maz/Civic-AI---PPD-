import React, { useState } from 'react';
import { X, ShieldCheck, Truck, Upload, CheckCircle2, Play, MessageSquare, Camera, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getStatusBadgeColor, getHumanStatusLabel, formatISTDateTime } from '@civicai/shared';
import { EvidenceImage } from './EvidenceImage.jsx';

export function DispatchModal({ incident, onClose, onUpdated }) {
  const [department, setDepartment] = useState(incident.assignedDepartment || 'Road Maintenance');
  const [unit, setUnit] = useState(incident.responderUnit || 'Unit Response-01');
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [showWorkDoneForm, setShowWorkDoneForm] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [workerNotes, setWorkerNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusTransition = async (targetStatus) => {
    setLoading(true);
    try {
      const res = await axios.patch(`/api/incidents/${incident.id}/status`, {
        status: targetStatus,
        assignedDepartment: department,
        responderUnit: unit,
        changedBy: 'Municipality Official'
      });
      if (res.data.success) {
        onUpdated(res.data.incident);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!progressMsg.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`/api/incidents/${incident.id}/progress`, {
        message: progressMsg.trim(),
        updatedBy: 'Municipality Official',
        imageUrl: proofImage || null
      });
      if (res.data.success) {
        onUpdated(res.data.incident);
        setShowProgressForm(false);
        setProgressMsg('');
        setProofImage(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProofImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleWorkDoneSubmit = async (e, targetStatus = 'WORK_COMPLETED') => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch(`/api/incidents/${incident.id}/status`, {
        status: targetStatus,
        resolutionProofUrl: proofImage || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500',
        workerNotes: workerNotes || 'Work completed by municipal crew.',
        changedBy: 'Municipality Official'
      });
      if (res.data.success) {
        onUpdated(res.data.incident);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const spin = loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null;
  const stageTitle = 'mb-1 text-[15px] font-bold text-slate-900';
  const stageHint = 'mb-3 mt-0 text-[13px] text-slate-600';
  const amberBtn = 'btn w-full border-transparent bg-amber-700 text-white shadow-xs hover:bg-amber-800 active:bg-amber-900';

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="dispatch-modal-title">
      <div className="modal-box max-h-[92vh] max-w-[640px]">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="dispatch-modal-title" className="flex items-center gap-2 font-display text-xl font-bold text-slate-900 mb-0">
              <Truck size={22} className="shrink-0 text-blue-600" aria-hidden="true" />
              Municipality Official Control Panel
            </h3>
            <p className="mt-0.5 text-sm text-slate-600 mb-0">Ticket #{incident.id}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 border-0 bg-transparent">
            <X size={20} />
          </button>
        </div>

        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-base font-bold text-slate-900 mb-0">{incident.title}</h4>
            <span className="badge" style={{ '--badge-color': getStatusBadgeColor(incident.status) }}>
              {getHumanStatusLabel(incident.status)}
            </span>
          </div>
          <p className="mb-2 text-sm text-slate-600 mt-0">{incident.description}</p>
          <div className="text-[13px] font-medium text-blue-800">📍 {incident.address}</div>
        </div>

        {/* Action-Oriented "NEXT ACTION" Card for Municipality Official */}
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-800">
            CURRENT WORKFLOW ACTION REQUIRED
          </div>

          {(incident.status === 'SUBMITTED' || incident.status === 'AI_ANALYZED') && (
            <div>
              <div className={stageTitle}>
                Verify Complaint Details & AI Categorization
              </div>
              <p className={stageHint}>
                Review citizen report and confirm issue category before department dispatch.
              </p>
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => handleStatusTransition('VERIFIED')}
                disabled={loading}
                aria-busy={loading}
              >
                {spin || <CheckCircle2 size={16} />} Verify Complaint
              </button>
            </div>
          )}

          {incident.status === 'VERIFIED' && (
            <div>
              <div className={stageTitle}>
                Start Field Team Preparation
              </div>
              <p className={stageHint}>
                Dispatch municipal worker squad and update status to Work Started.
              </p>
              <button
                type="button"
                className={amberBtn}
                onClick={() => handleStatusTransition('UNDER_PROGRESS')}
                disabled={loading}
                aria-busy={loading}
              >
                {spin || <Play size={16} />} START WORK (Mark Work Started)
              </button>
            </div>
          )}

          {(incident.status === 'UNDER_PROGRESS' || incident.status === 'In Progress' || incident.status === 'ASSIGNED') && (
            <div>
              <div className={stageTitle}>
                🔴 WORK STARTED — Proceed to Active Work Execution
              </div>
              <p className={stageHint}>
                The department crew has reached the location. Click below to begin active site work.
              </p>
              <button
                type="button"
                className={amberBtn}
                onClick={() => handleStatusTransition('WORK_IN_ACTION')}
                disabled={loading}
                aria-busy={loading}
              >
                {spin || <Play size={16} />} START WORK IN PROGRESS
              </button>
            </div>
          )}

          {incident.status === 'WORK_IN_ACTION' && (
            <div>
              <div className={stageTitle}>
                🔵 WORK IN PROGRESS — Active Work Stage
              </div>
              <p className={stageHint}>
                Post progress updates or submit completion evidence photo when repairs are completed.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => { setShowProgressForm(!showProgressForm); setShowWorkDoneForm(false); }}
                  aria-expanded={showProgressForm}
                  className="btn flex-1 border-blue-300 bg-white font-semibold text-blue-800 hover:bg-blue-50 active:bg-blue-100"
                >
                  <MessageSquare size={16} /> + Add Progress Update
                </button>

                <button
                  type="button"
                  onClick={() => { setShowWorkDoneForm(!showWorkDoneForm); setShowProgressForm(false); }}
                  aria-expanded={showWorkDoneForm}
                  className="btn flex-1 border-emerald-300 bg-white font-semibold text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100"
                >
                  <Camera size={16} /> ✓ Mark Work Completed
                </button>
              </div>

              {/* Progress Update Sub-Form */}
              {showProgressForm && (
                <form onSubmit={handleSaveProgress} className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-white p-3.5">
                  <div>
                    <label htmlFor="dm-progress-msg" className="field-label">Progress Update Message</label>
                    <input
                      id="dm-progress-msg"
                      className="form-input"
                      value={progressMsg}
                      onChange={e => setProgressMsg(e.target.value)}
                      placeholder="e.g., Repair team reached reported location and started excavation."
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="dm-progress-photo" className="field-label">Optional Progress Photo</label>
                    <input id="dm-progress-photo" type="file" accept="image/*" onChange={handleProofImageChange} className="form-input" />
                    {proofImage && <img src={proofImage} alt="Progress Preview" className="mt-2 max-h-24 rounded-md object-cover" />}
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={loading} aria-busy={loading}>
                    {spin} Save Progress Update to MongoDB
                  </button>
                </form>
              )}

              {/* Work Completed Upload Sub-Form */}
              {showWorkDoneForm && (
                <form onSubmit={(e) => handleWorkDoneSubmit(e, 'WORK_COMPLETED')} className="mt-3 space-y-3 rounded-lg border border-emerald-200 bg-white p-3.5">
                  <div>
                    <label htmlFor="dm-proof-photo" className="field-label">Completion Evidence Photo</label>
                    <input id="dm-proof-photo" type="file" accept="image/*" onChange={handleProofImageChange} className="form-input" />
                    {proofImage && <img src={proofImage} alt="Proof" className="mt-2 max-h-28 rounded-md object-cover" />}
                  </div>
                  <div>
                    <label htmlFor="dm-completion-note" className="field-label">Completion Note</label>
                    <input id="dm-completion-note" className="form-input" value={workerNotes} onChange={e => setWorkerNotes(e.target.value)} placeholder="e.g., Road pothole has been filled and section sealed with asphalt." required />
                  </div>
                  <button type="submit" className="btn btn-success w-full" disabled={loading} aria-busy={loading}>
                    {spin} Submit Work Completion
                  </button>
                </form>
              )}
            </div>
          )}

          {(incident.status === 'WORK_COMPLETED' || incident.status === 'WORK_DONE') && (
            <div>
              <div className={stageTitle}>
                🟢 WORK COMPLETED — Review Completion Evidence
              </div>
              <p className={stageHint}>
                Verify submitted evidence and mark the issue as resolved.
              </p>
              {incident.resolutionProofUrl && (
                <div className="mb-3 rounded-lg border border-emerald-200 bg-white p-3">
                  <div className="mb-1.5 text-[13px] font-bold text-emerald-800">Municipality Completion Evidence</div>
                  <EvidenceImage src={incident.resolutionProofUrl} alt="Completion Evidence" className="mb-1.5" maxH="max-h-36" />
                  <div className="text-[13px] text-slate-700">{incident.workerNotes}</div>
                </div>
              )}
              <button
                type="button"
                className="btn btn-success w-full"
                onClick={() => handleStatusTransition('RESOLVED')}
                disabled={loading}
                aria-busy={loading}
              >
                {spin || <CheckCircle2 size={16} />} MARK AS RESOLVED
              </button>
            </div>
          )}

          {(incident.status === 'RESOLVED' || incident.status === 'Resolved') && (
            <div>
              <div className={stageTitle}>
                🟢 ISSUE RESOLVED — Final Ticket Closure
              </div>
              <p className={stageHint}>
                Issue has been resolved. Close complaint ticket to archive record.
              </p>
              <button
                type="button"
                className="btn btn-secondary w-full font-bold"
                onClick={() => handleStatusTransition('CLOSED')}
                disabled={loading}
                aria-busy={loading}
              >
                {spin} CLOSE COMPLAINT
              </button>
            </div>
          )}

          {incident.status === 'CLOSED' && (
            <div className="p-2 text-center text-sm font-semibold text-slate-700">
              ✓ COMPLAINT CLOSED
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="dm-department" className="field-label">Assigned Municipal Department</label>
            <select id="dm-department" className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="Road Maintenance">Road Maintenance</option>
              <option value="Municipal/Sanitation">Municipal/Sanitation</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Animal Control & Sanitation">Animal Control & Sanitation</option>
            </select>
          </div>

          <div>
            <label htmlFor="dm-unit" className="field-label">Field Team / Worker Unit ID</label>
            <input
              id="dm-unit"
              className="form-input"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="e.g., Squad Road-04"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}
