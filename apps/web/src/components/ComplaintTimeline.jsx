import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { formatISTDateTime } from '@civicai/shared';

const STAGES = [
  { id: 'SUBMITTED', label: 'Complaint Submitted', legacy: 'Reported' },
  { id: 'AI_ANALYZED', label: 'AI Analysis Completed', legacy: 'Triaged' },
  { id: 'VERIFIED', label: 'Complaint Verified' },
  { id: 'ASSIGNED', label: 'Department Assigned', legacy: 'Dispatched' },
  { id: 'UNDER_PROGRESS', label: 'Work Started', legacy: 'In Progress' },
  { id: 'WORK_IN_ACTION', label: 'Work In Progress' },
  { id: 'WORK_COMPLETED', label: 'Work Completed', legacy: 'WORK_DONE' },
  { id: 'RESOLVED', label: 'Issue Resolved', legacy: 'Resolved' },
  { id: 'CLOSED', label: 'Complaint Closed' }
];

export function ComplaintTimeline({ currentStatus, statusHistory = [] }) {
  const activeIndex = STAGES.findIndex(s => s.id === currentStatus || s.legacy === currentStatus);
  const normalizedIndex = activeIndex !== -1 ? activeIndex : 1;

  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-wider text-slate-600">
        <span>COMPLAINT PROGRESS TIMELINE</span>
        <span className="font-semibold normal-case tracking-normal text-blue-700">Asia/Kolkata (IST)</span>
      </div>

      <ol className="relative m-0 flex list-none flex-col gap-3 p-0">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < normalizedIndex;
          const isCurrent = idx === normalizedIndex;

          const safeHistory = Array.isArray(statusHistory) ? statusHistory : [];
          const historyEntry = safeHistory.find(h => h && (h.status === stage.id || h.status === stage.legacy));

          return (
            <li
              key={stage.id}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex items-start gap-3"
            >
              {/* Timeline Connector Line */}
              {idx < STAGES.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`absolute left-[15px] top-8 z-0 h-[calc(100%+4px)] w-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`}
                />
              )}

              {/* Status Circle Icon */}
              <div
                className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'border-2 border-slate-300 bg-white text-slate-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={18} /> : isCurrent ? <Clock size={18} /> : <Circle size={14} />}
              </div>

              {/* Stage Content */}
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm ${isCurrent ? 'font-extrabold text-blue-800' : isCompleted ? 'font-semibold text-slate-900' : 'font-medium text-slate-500'}`}>
                    {isCompleted ? `✓ ${stage.label}` : isCurrent ? `● ${stage.label}` : `○ ${stage.label}`}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full border border-blue-300 bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                      Current Stage
                    </span>
                  )}
                </div>

                {historyEntry && (
                  <div className="mt-0.5 text-xs text-slate-600">
                    {formatISTDateTime(historyEntry.changedAt)} {historyEntry.changedBy ? `• ${historyEntry.changedBy}` : ''}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
