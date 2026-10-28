import React, { useState } from 'react';
import { Play, MessageSquare, Camera, CheckCircle2, AlertCircle, ShieldCheck, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { formatISTDateTime } from '@civicai/shared';
import { EvidenceImage } from './EvidenceImage.jsx';

export function MunicipalityActionPanel({ incident, currentUser, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showWorkCompletedModal, setShowWorkCompletedModal] = useState(false);
  const [showResolveConfirmModal, setShowResolveConfirmModal] = useState(false);
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

  // Form states
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPhoto, setProgressPhoto] = useState(null);
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [completionNote, setCompletionNote] = useState('');

  if (currentUser?.role !== 'Official') {
    return null; // Strict Role-based scoping: Hide controls from Citizens
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('civicai_token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const handleStatusUpdate = async (targetStatus, extraData = {}) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `/api/incidents/${incident.id}/status`,
        {
          status: targetStatus,
          changedBy: currentUser?.name || 'Municipality Official',
          ...extraData
        },
        getAuthHeaders()
      );
      if (res.data?.success) {
        onUpdated(res.data.incident);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleProgressPhotoChange = (e, setFn) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFn(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProgressUpdate = async (e) => {
    e.preventDefault();
    if (!progressMsg.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/incidents/${incident.id}/progress`,
        {
          message: progressMsg.trim(),
          updatedBy: currentUser?.name || 'Municipality Official',
          imageUrl: progressPhoto || null
        },
        getAuthHeaders()
      );
      if (res.data?.success) {
        onUpdated(res.data.incident);
        setShowProgressModal(false);
        setProgressMsg('');
        setProgressPhoto(null);
      }
    } catch (err) {
      console.error('Failed to save progress update:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWorkCompleted = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalResolutionUrl = 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500';

      if (completionPhoto) {
        try {
          const uploadRes = await axios.post('/api/upload', {
            image: completionPhoto,
            type: 'resolution',
            incidentId: incident.id
          });
          if (uploadRes.data?.success && uploadRes.data?.media?.url) {
            finalResolutionUrl = uploadRes.data.media.url;
          }
        } catch (uploadErr) {
          console.warn('Resolution photo upload failed, using preview URL reference:', uploadErr);
          finalResolutionUrl = completionPhoto;
        }
      }

      const res = await axios.patch(
        `/api/incidents/${incident.id}/status`,
        {
          status: 'WORK_COMPLETED',
          resolutionProofUrl: finalResolutionUrl,
          workerNotes: completionNote || 'Pothole has been filled and damaged road section repaired.',
          changedBy: currentUser?.name || 'Municipality Official'
        },
        getAuthHeaders()
      );
      if (res.data?.success) {
        onUpdated(res.data.incident);
        setShowWorkCompletedModal(false);
        setCompletionPhoto(null);
        setCompletionNote('');
      }
    } catch (err) {
      console.error('Failed to mark work completed:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleConfirmResolve = async () => {
    setShowResolveConfirmModal(false);
    await handleStatusUpdate('RESOLVED');
  };

  const handleConfirmClose = async () => {
    setShowCloseConfirmModal(false);
    await handleStatusUpdate('CLOSED');
  };

  const status = incident.status;
  const spin = loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null;
  const cancelBtn = 'btn btn-secondary flex-1';
  const infoBox = (tone) => `mb-4 rounded-lg border px-4 py-3 ${tone}`;

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
        <ShieldCheck size={16} aria-hidden="true" /> MUNICIPALITY NEXT ACTION CONTROL
      </div>

      {/* Stage 1: SUBMITTED / AI_ANALYZED */}
      {(status === 'SUBMITTED' || status === 'AI_ANALYZED') && (
        <div>
          <div className="mb-1 text-base font-bold text-slate-900">
            CURRENT STATUS: 🟡 SUBMITTED / AI ANALYZED
          </div>
          <p className="mb-4 text-sm text-slate-600 mt-0">
            Review citizen report details and verify issue category for department dispatch.
          </p>
          <button
            className="btn btn-primary w-full"
            onClick={() => handleStatusUpdate('VERIFIED')}
            disabled={loading}
            aria-busy={loading}
          >
            {spin || <CheckCircle2 size={16} />} Verify Complaint
          </button>
        </div>
      )}

      {/* Stage 2: VERIFIED / ASSIGNED */}
      {(status === 'VERIFIED' || status === 'ASSIGNED') && (
        <div>
          <div className="mb-1 text-base font-bold text-slate-900">
            CURRENT STATUS: 🟠 COMPLAINT VERIFIED
          </div>
          <p className="mb-4 text-sm text-slate-600 mt-0">
            Dispatch field maintenance team and initiate work preparation.
          </p>
          <button
            className="btn w-full border-transparent bg-amber-700 text-white shadow-xs hover:bg-amber-800 active:bg-amber-900"
            onClick={() => handleStatusUpdate('UNDER_PROGRESS')}
            disabled={loading}
            aria-busy={loading}
          >
            {spin || <Play size={16} />} Mark Work Started (UNDER_PROGRESS)
          </button>
        </div>
      )}

      {/* Stage 3: UNDER_PROGRESS -> WORK_IN_ACTION */}
      {status === 'UNDER_PROGRESS' && (
        <div>
          <div className="mb-1 text-base font-bold text-slate-900">
            CURRENT STATUS: 🟠 WORK STARTED
          </div>
          <p className="mb-4 text-sm text-slate-600 mt-0">
            Field crew arrived at location. Begin active work execution on site.
          </p>
          <button
            className="btn w-full border-transparent bg-amber-700 text-white shadow-xs hover:bg-amber-800 active:bg-amber-900"
            onClick={() => handleStatusUpdate('WORK_IN_ACTION')}
            disabled={loading}
            aria-busy={loading}
          >
            {spin || <Play size={16} />} START WORK IN PROGRESS (WORK_IN_ACTION)
          </button>
        </div>
      )}

      {/* Stage 4: WORK_IN_ACTION / WORK_IN_PROGRESS / In Progress */}
      {(status === 'WORK_IN_ACTION' || status === 'WORK_IN_PROGRESS' || status === 'In Progress') && (
        <div>
          <div className={infoBox('border-blue-200 bg-white')}>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              CURRENT STATUS
            </div>
            <div className="mt-1 flex items-center gap-2 text-lg font-extrabold text-blue-800">
              🔵 WORK IN PROGRESS
            </div>
            <div className="mt-1.5 text-sm text-slate-700">
              The assigned department is actively working on this complaint.
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowProgressModal(true)}
              className="btn flex-1 border-blue-300 bg-white font-bold text-blue-800 hover:bg-blue-50 active:bg-blue-100"
            >
              <MessageSquare size={16} /> + ADD PROGRESS UPDATE
            </button>

            <button
              type="button"
              onClick={() => setShowWorkCompletedModal(true)}
              className="btn btn-success flex-1 font-bold"
            >
              <CheckCircle2 size={16} /> ✓ MARK WORK COMPLETED
            </button>
          </div>
        </div>
      )}

      {/* Stage 5: WORK_COMPLETED / WORK_DONE */}
      {(status === 'WORK_COMPLETED' || status === 'WORK_DONE') && (
        <div>
          <div className={infoBox('border-emerald-200 bg-white')}>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              CURRENT STATUS
            </div>
            <div className="mt-1 flex items-center gap-2 text-lg font-extrabold text-emerald-800">
              🟢 WORK COMPLETED
            </div>

            {incident.resolutionProofUrl && (
              <div className="mt-3">
                <div className="mb-1.5 text-sm font-bold text-emerald-800">
                  Completion Evidence Photo
                </div>
                <EvidenceImage src={incident.resolutionProofUrl} alt="Completion evidence" maxH="max-h-44" />
              </div>
            )}

            {incident.workerNotes && (
              <div className="mt-2.5 text-sm italic text-slate-700">
                "{incident.workerNotes}"
              </div>
            )}

            <div className="mt-2 text-xs text-slate-600">
              Completed: <strong>{formatISTDateTime(incident.updatedAt || incident.reportedAt)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-success min-h-11 w-full font-bold"
            onClick={() => setShowResolveConfirmModal(true)}
            disabled={loading}
            aria-busy={loading}
          >
            {spin || <CheckCircle2 size={18} />} ✓ MARK AS RESOLVED
          </button>
        </div>
      )}

      {/* Stage 6: RESOLVED / Resolved */}
      {(status === 'RESOLVED' || status === 'Resolved') && (
        <div>
          <div className={infoBox('border-emerald-200 bg-white')}>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              CURRENT STATUS
            </div>
            <div className="mt-1 flex items-center gap-2 text-lg font-extrabold text-emerald-800">
              🟢 ISSUE RESOLVED
            </div>
            <div className="mt-1.5 text-sm text-slate-700">
              Resolution details recorded. Citizen feedback rating requested.
            </div>
            <div className="mt-1.5 text-xs text-slate-600">
              Resolved: <strong>{formatISTDateTime(incident.updatedAt)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary min-h-11 w-full font-bold"
            onClick={() => setShowCloseConfirmModal(true)}
            disabled={loading}
            aria-busy={loading}
          >
            {spin} [ CLOSE COMPLAINT ]
          </button>
        </div>
      )}

      {/* Stage 7: CLOSED */}
      {status === 'CLOSED' && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-[15px] font-bold text-slate-700">
          ✓ COMPLAINT CLOSED
        </div>
      )}

      {/* MODAL 1: ADD PROGRESS UPDATE */}
      {showProgressModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="progress-modal-title">
          <div className="modal-box max-w-[480px]">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="progress-modal-title" className="font-display text-xl font-bold text-slate-900 mb-0">
                Progress Update
              </h3>
              <button onClick={() => setShowProgressModal(false)} aria-label="Close" className="grid size-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 border-0 bg-transparent">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProgressUpdate} className="space-y-4">
              <div>
                <label htmlFor="mp-progress-msg" className="field-label">Progress Update</label>
                <textarea
                  id="mp-progress-msg"
                  className="form-textarea"
                  rows={3}
                  value={progressMsg}
                  onChange={e => setProgressMsg(e.target.value)}
                  placeholder="e.g., Repair work has started at the reported location."
                  required
                />
              </div>

              <div>
                <label htmlFor="mp-progress-photo" className="field-label">Optional Progress Photo</label>
                <input
                  id="mp-progress-photo"
                  type="file"
                  accept="image/*"
                  onChange={e => handleProgressPhotoChange(e, setProgressPhoto)}
                  className="form-input"
                />
                {progressPhoto && (
                  <img src={progressPhoto} alt="Progress Preview" className="mt-2 max-h-32 rounded-md object-cover" />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className={cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {spin} Save Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MARK WORK COMPLETED */}
      {showWorkCompletedModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="completion-modal-title">
          <div className="modal-box max-w-[500px]">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="completion-modal-title" className="font-display text-xl font-bold text-slate-900 mb-0">
                WORK COMPLETION
              </h3>
              <button onClick={() => setShowWorkCompletedModal(false)} aria-label="Close" className="grid size-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 border-0 bg-transparent">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitWorkCompleted} className="space-y-4">
              <div>
                <label htmlFor="mp-completion-photo" className="field-label">Completion Evidence Photo</label>
                <input
                  id="mp-completion-photo"
                  type="file"
                  accept="image/*"
                  onChange={e => handleProgressPhotoChange(e, setCompletionPhoto)}
                  className="form-input"
                />
                {completionPhoto && (
                  <img src={completionPhoto} alt="Completion Preview" className="mt-2 max-h-36 rounded-md object-cover" />
                )}
              </div>

              <div>
                <label htmlFor="mp-completion-note" className="field-label">Completion / Resolution Note</label>
                <textarea
                  id="mp-completion-note"
                  className="form-textarea"
                  rows={3}
                  value={completionNote}
                  onChange={e => setCompletionNote(e.target.value)}
                  placeholder="e.g., Pothole has been filled and the damaged road section has been repaired."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWorkCompletedModal(false)}
                  className={cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success flex-1"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {spin} Submit Work Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: RESOLVE */}
      {showResolveConfirmModal && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="resolve-modal-title">
          <div className="modal-box max-w-[420px] text-center">
            <AlertCircle size={44} className="mx-auto mb-3 text-amber-500" aria-hidden="true" />
            <h3 id="resolve-modal-title" className="mb-2 font-display text-xl font-bold text-slate-900">
              Confirm Resolution
            </h3>
            <p className="mb-5 text-sm text-slate-600 mt-0">
              Are you sure the reported issue has been resolved?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResolveConfirmModal(false)}
                className={cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success flex-1"
                onClick={handleConfirmResolve}
                disabled={loading}
                aria-busy={loading}
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: CLOSE */}
      {showCloseConfirmModal && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="close-modal-title">
          <div className="modal-box max-w-[420px] text-center">
            <AlertCircle size={44} className="mx-auto mb-3 text-slate-500" aria-hidden="true" />
            <h3 id="close-modal-title" className="mb-2 font-display text-xl font-bold text-slate-900">
              Confirm Ticket Closure
            </h3>
            <p className="mb-5 text-sm text-slate-600 mt-0">
              Close this complaint after successful resolution?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCloseConfirmModal(false)}
                className={cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn flex-1 border-transparent bg-slate-700 text-white shadow-xs hover:bg-slate-800 active:bg-slate-900"
                onClick={handleConfirmClose}
                disabled={loading}
                aria-busy={loading}
              >
                Close Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
