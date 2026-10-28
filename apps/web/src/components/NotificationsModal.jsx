import React from 'react';
import { X, Bell, CheckCircle2 } from 'lucide-react';
import { formatISTDateTime, getHumanStatusLabel } from '@civicai/shared';

export function NotificationsModal({ isOpen, onClose, incidents = [] }) {
  if (!isOpen) return null;

  const notifications = [];
  incidents.forEach(inc => {
    if (Array.isArray(inc.statusHistory)) {
      inc.statusHistory.forEach(history => {
        notifications.push({
          id: `${inc.id}-${history.changedAt}`,
          incidentId: inc.id,
          title: inc.title,
          status: history.status,
          updatedBy: history.changedBy || 'System Official',
          timestamp: history.changedAt,
          category: inc.category
        });
      });
    }
  });

  notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="notif-modal-title">
      <div className="modal-box max-h-[85vh] max-w-[600px]">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <Bell size={22} className="text-blue-600" aria-hidden="true" />
            <h3 id="notif-modal-title" className="font-display text-xl font-bold text-slate-900 mb-0">
              Civic Notification Center
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 border-0 bg-transparent">
            <X size={20} />
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-600">
            <Bell size={32} className="mx-auto mb-2 text-slate-300" aria-hidden="true" />
            <p className="text-sm mt-0 mb-0">No notifications yet. Status updates will appear here in real time.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.slice(0, 25).map(item => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                  <span className="text-xs font-bold text-blue-800">
                    Ticket #{item.incidentId} • {item.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatISTDateTime(item.timestamp)}
                  </span>
                </div>
                <div className="mb-1 text-sm font-semibold text-slate-900">
                  {item.title}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-emerald-800">
                  <CheckCircle2 size={14} aria-hidden="true" /> <span>Status: <strong>{getHumanStatusLabel(item.status)}</strong> ({item.updatedBy})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
