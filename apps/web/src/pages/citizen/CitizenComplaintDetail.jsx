import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, MessageSquare, Star, MapPin, CheckCircle2 } from 'lucide-react';
import { ComplaintTimeline } from '../../components/ComplaintTimeline.jsx';
import { getSeverityBadgeColor, getStatusBadgeColor, getHumanStatusLabel, formatISTDateTime } from '@civicai/shared';
import { EvidenceImage } from '../../components/EvidenceImage.jsx';

export function CitizenComplaintDetail({ incidents, onOpenFeedbackModal }) {
  const { id } = useParams();
  const incident = incidents.find(i => i.id === id || i.id?.toLowerCase() === id?.toLowerCase());

  if (!incident) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-0">Complaint Not Found</h2>
        <p className="mt-2 text-sm text-slate-600 mb-0">No complaint found matching ID: {id}</p>
        <Link to="/" className="btn btn-primary mt-6 no-underline">
          Return to Citizen Portal Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8">
      <Link to="/" className="mb-5 inline-flex min-h-10 items-center gap-1.5 rounded-lg pr-2 text-sm font-semibold text-blue-700 no-underline hover:text-blue-800">
        <ArrowLeft size={16} /> Back to Citizen Portal
      </Link>

      <div className="panel p-5 sm:p-7">
        <div className="mb-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="badge" style={{ '--badge-color': getSeverityBadgeColor(incident.severity) }}>
              {incident.severity}
            </span>
            <span className="badge" style={{ '--badge-color': getStatusBadgeColor(incident.status) }}>
              {getHumanStatusLabel(incident.status)}
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl mb-0">
            {incident.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-start gap-x-1.5 gap-y-1 text-sm text-slate-600 mb-0">
            <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{incident.address} • Department: <strong className="text-slate-900">{incident.assignedDepartment}</strong></span>
          </p>
        </div>

        {/* Read-Only Timeline */}
        <ComplaintTimeline
          currentStatus={incident.status}
          statusHistory={incident.statusHistory}
        />

        <p className="mb-6 text-base leading-7 text-slate-700 mt-0">
          {incident.description}
        </p>

        {/* Evidence Photo */}
        {incident.imageUrl && (
          <div className="mb-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Citizen submitted evidence photo
            </div>
            <EvidenceImage src={incident.imageUrl} alt="Citizen evidence" maxH="max-h-[350px]" />
          </div>
        )}

        {/* AI Analysis Summary */}
        {incident.aiAnalysis && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2 font-bold text-blue-800">
              <Sparkles size={18} />
              CivicAI Vision Computer Diagnostic Summary
            </div>
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <div>Detected Issue: <strong className="text-slate-900">{incident.aiAnalysis.detectedIssue}</strong></div>
              <div>Model Confidence: <strong className="text-slate-900">{Math.round((incident.aiAnalysis.confidence || 0.94) * 100)}%</strong></div>
            </div>
          </div>
        )}

        {/* Municipality Progress Log */}
        {incident.progressUpdates && incident.progressUpdates.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 font-bold text-slate-900">
              <MessageSquare size={18} className="text-blue-600" /> Municipality Progress Updates ({incident.progressUpdates.length})
            </div>
            <div className="grid gap-3">
              {incident.progressUpdates.map((up, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 border-l-[3px] border-l-blue-400 bg-white px-4 py-3 text-sm">
                  <div className="text-slate-800">{up.message}</div>
                  {up.imageUrl && (
                    <EvidenceImage src={up.imageUrl} alt="Progress update photo" className="mt-2" maxH="max-h-40" />
                  )}
                  <div className="mt-1.5 text-xs text-slate-500">
                    Posted by {up.updatedBy} • {formatISTDateTime(up.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Proof */}
        {(incident.status === 'WORK_COMPLETED' || incident.status === 'WORK_DONE' || incident.status === 'RESOLVED' || incident.status === 'CLOSED' || incident.status === 'Resolved') && incident.resolutionProofUrl && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 size={18} /> Municipality Completion Evidence
            </div>
            <EvidenceImage src={incident.resolutionProofUrl} alt="Resolution proof" maxH="max-h-[350px]" />
          </div>
        )}

        {/* Citizen Rating */}
        {(incident.status === 'RESOLVED' || incident.status === 'CLOSED' || incident.status === 'Resolved') && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            {incident.feedbackRating ? (
              <div>
                <div className="mb-1 flex items-center gap-2 font-bold text-amber-900">
                  <Star size={18} className="fill-amber-500 text-amber-500" /> Citizen Feedback Rating: {incident.feedbackRating} / 5 Stars
                </div>
                {incident.feedbackComment && (
                  <div className="text-sm text-slate-700">"{incident.feedbackComment}"</div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-amber-900">
                  This complaint has been resolved. Please share your citizen feedback.
                </div>
                <button
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-400 active:bg-amber-600 border-0"
                  onClick={() => onOpenFeedbackModal(incident)}
                >
                  <Star size={14} /> Give Feedback
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
