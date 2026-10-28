import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, AlertOctagon, Activity, PieChart as PieChartIcon } from 'lucide-react';

export function AnalyticsDashboard({ incidents = [] }) {
  const total = incidents.length;
  const critical = incidents.filter(i => i.severity === 'Critical').length;
  const activeWork = incidents.filter(i => ['UNDER_PROGRESS', 'In Progress', 'WORK_IN_ACTION', 'WORK_COMPLETED', 'WORK_DONE'].includes(i.status)).length;
  const resolved = incidents.filter(i => ['RESOLVED', 'CLOSED', 'Resolved'].includes(i.status)).length;

  // Pie chart calculation for Pothole Management
  const potholeTotal = incidents.filter(i => i.category === 'Pothole & Road Damage' || i.category === 'pothole').length || 1;
  const potholeActive = incidents.filter(i => (i.category === 'Pothole & Road Damage' || i.category === 'pothole') && ['UNDER_PROGRESS', 'WORK_IN_ACTION'].includes(i.status)).length;
  const potholeCompleted = incidents.filter(i => (i.category === 'Pothole & Road Damage' || i.category === 'pothole') && ['WORK_COMPLETED', 'WORK_DONE', 'RESOLVED', 'CLOSED'].includes(i.status)).length;
  const potholePending = Math.max(0, potholeTotal - potholeActive - potholeCompleted);

  // Pie chart calculation for Waste Management
  const wasteTotal = incidents.filter(i => i.category === 'Municipal/Sanitation' || i.category === 'garbage' || i.category === 'Sanitation & Waste Overflow').length || 1;
  const wasteActive = incidents.filter(i => (i.category === 'Municipal/Sanitation' || i.category === 'garbage' || i.category === 'Sanitation & Waste Overflow') && ['UNDER_PROGRESS', 'WORK_IN_ACTION'].includes(i.status)).length;
  const wasteCompleted = incidents.filter(i => (i.category === 'Municipal/Sanitation' || i.category === 'garbage' || i.category === 'Sanitation & Waste Overflow') && ['WORK_COMPLETED', 'WORK_DONE', 'RESOLVED', 'CLOSED'].includes(i.status)).length;
  const wastePending = Math.max(0, wasteTotal - wasteActive - wasteCompleted);

  const roadCount = incidents.filter(i => i.assignedDepartment === 'Road Maintenance').length;
  const sanitationCount = incidents.filter(i => i.assignedDepartment === 'Municipal/Sanitation').length;
  const waterCount = incidents.filter(i => i.assignedDepartment === 'Water & Sanitation').length;

  const kpis = [
    { label: 'TOTAL COMPLAINTS', value: total, Icon: Activity, tile: 'bg-blue-100 text-blue-700', num: 'text-slate-900' },
    { label: 'CRITICAL SEVERITY', value: critical, Icon: AlertOctagon, tile: 'bg-rose-100 text-rose-700', num: 'text-rose-700' },
    { label: 'ACTIVE SITE WORK', value: activeWork, Icon: TrendingUp, tile: 'bg-amber-100 text-amber-700', num: 'text-amber-700' },
    { label: 'RESOLVED & CLOSED', value: resolved, Icon: CheckCircle, tile: 'bg-emerald-100 text-emerald-700', num: 'text-emerald-700' },
  ];

  const ARC = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

  const renderPie = ({ title, iconClass, doneColor, activeColor, done, active, pending, total: t, labels }) => (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900">
        <PieChartIcon size={18} className={iconClass} aria-hidden="true" /> {title}
      </div>
      <div className="flex flex-wrap items-center justify-around gap-4">
        <svg width="130" height="130" viewBox="0 0 36 36" role="img" aria-label={`${title}: ${done} ${labels[0]}, ${active} ${labels[1]}, ${pending} ${labels[2]}`}>
          <path d={ARC} fill="none" stroke="#e2e8f0" strokeWidth="3.8" />
          <path d={ARC} fill="none" stroke={doneColor} strokeWidth="3.8" strokeDasharray={`${Math.round((done / t) * 100)}, 100`} />
          <path d={ARC} fill="none" stroke={activeColor} strokeWidth="3.8" strokeDasharray={`${Math.round((active / t) * 100)}, 100`} strokeDashoffset={`-${Math.round((done / t) * 100)}`} />
        </svg>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-slate-700">
          <li className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: doneColor }} /> {labels[0]}: <strong className="text-slate-900">{done}</strong></li>
          <li className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: activeColor }} /> {labels[1]}: <strong className="text-slate-900">{active}</strong></li>
          <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-slate-300" /> {labels[2]}: <strong className="text-slate-900">{pending}</strong></li>
        </ul>
      </div>
    </div>
  );

  const bars = [
    { label: 'Road Maintenance', count: roadCount, color: 'bg-amber-500' },
    { label: 'Municipal / Sanitation', count: sanitationCount, color: 'bg-teal-600' },
    { label: 'Water & Sanitation', count: waterCount, color: 'bg-blue-600' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, Icon, tile, num }) => (
          <div key={label} className="panel flex items-center gap-4 p-4 sm:p-5">
            <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${tile}`}>
              <Icon size={24} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-wide text-slate-600">{label}</div>
              <div className={`font-display text-3xl font-extrabold tabular-nums leading-tight ${num}`}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pie Charts Row */}
      <div className="grid gap-5 lg:grid-cols-2">
        {renderPie({ title: 'PIE CHART — POTHOLE MANAGEMENT', iconClass: 'text-amber-600', doneColor: '#059669', activeColor: '#d97706', done: potholeCompleted, active: potholeActive, pending: potholePending, total: potholeTotal, labels: ['Completed', 'Work In Action', 'Pending'] })}
        {renderPie({ title: 'PIE CHART — WASTE MANAGEMENT', iconClass: 'text-teal-600', doneColor: '#0d9488', activeColor: '#7c3aed', done: wasteCompleted, active: wasteActive, pending: wastePending, total: wasteTotal, labels: ['Cleared Waste', 'Active Clearing', 'Pending Queue'] })}
      </div>

      {/* Department Workload Bar Chart */}
      <div className="panel p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900">
          <BarChart3 size={18} className="text-blue-600" aria-hidden="true" /> MUNICIPAL DEPARTMENT WORKLOAD DISTRIBUTION
        </div>
        <div className="flex flex-col gap-4">
          {bars.map(({ label, count, color }) => (
            <div key={label}>
              <div className="mb-1.5 flex justify-between gap-3 text-sm text-slate-700">
                <span>{label}</span>
                <span><strong className="text-slate-900">{count}</strong> complaints</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={`${label} share of complaints`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(100, (count / (total || 1)) * 100))}>
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (count / (total || 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
