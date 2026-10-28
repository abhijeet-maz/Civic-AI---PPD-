import React from 'react';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard.jsx';
import { BarChart3 } from 'lucide-react';

export function CommandCenterAnalytics({ incidents }) {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <div className="eyebrow">Performance</div>
        <h1 className="mt-1 flex items-start gap-2 font-display text-2xl font-extrabold tracking-tight text-slate-900 mb-0">
          <BarChart3 size={24} className="mt-0.5 shrink-0 text-blue-600" />
          Municipal Performance & Workload Analytics
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 mb-0">
          Real-time metrics, department workload distribution, and resolution performance analytics.
        </p>
      </div>

      <AnalyticsDashboard incidents={incidents} />
    </div>
  );
}
