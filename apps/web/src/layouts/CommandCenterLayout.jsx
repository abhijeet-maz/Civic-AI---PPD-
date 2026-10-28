import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Building2, LayoutDashboard, Layers, Map, BarChart3, Download, Sparkles, LogOut, UserCheck, Activity, Menu, X } from 'lucide-react';

const navItem = (active) =>
  `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold no-underline transition-colors ${
    active
      ? 'bg-blue-600 text-white shadow-xs'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`;

const sideBtn =
  'flex min-h-10 w-full border-0 bg-transparent items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white';

export function CommandCenterLayout({ currentUser, socketStatus, onLogout, onExportCSV, onOpenAiAssistantModal }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('civicai_token');
  let savedUser = null;
  try {
    const savedStr = localStorage.getItem('civicai_user');
    if (savedStr && savedStr !== 'undefined') savedUser = JSON.parse(savedStr);
  } catch {}
  const isOfficialRole = (currentUser && ['Official','Worker'].includes(currentUser.role)) ||
    (savedUser && ['Official','Worker'].includes(savedUser.role));
  if (!(Boolean(token) && isOfficialRole)) return <Navigate to="/command-center/login" replace />;

  const effectiveUser = (currentUser && ['Official','Worker'].includes(currentUser.role)) ? currentUser : (savedUser || currentUser);
  const active = (p) => location.pathname === p || (p === '/command-center/dashboard' && location.pathname === '/command-center') || (p === '/command-center/complaints' && location.pathname.startsWith('/command-center/complaints/'));
  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <nav aria-label="Command Center" className="flex flex-col gap-1">
      <Link to="/command-center/dashboard" onClick={closeMenu} aria-current={active('/command-center/dashboard') ? 'page' : undefined} className={navItem(active('/command-center/dashboard'))}><LayoutDashboard size={18}/> Overview</Link>
      <Link to="/command-center/complaints" onClick={closeMenu} aria-current={active('/command-center/complaints') ? 'page' : undefined} className={navItem(active('/command-center/complaints'))}><Layers size={18}/> Complaints</Link>
      <Link to="/command-center/map" onClick={closeMenu} aria-current={active('/command-center/map') ? 'page' : undefined} className={navItem(active('/command-center/map'))}><Map size={18}/> Live Map</Link>
      <Link to="/command-center/analytics" onClick={closeMenu} aria-current={active('/command-center/analytics') ? 'page' : undefined} className={navItem(active('/command-center/analytics'))}><BarChart3 size={18}/> Analytics</Link>
    </nav>
  );

  const toolbox = (
    <div className="flex flex-col gap-1">
      <button onClick={() => { closeMenu(); onOpenAiAssistantModal(); }} className={sideBtn}><Sparkles size={18}/> AI Assistant</button>
      <button onClick={() => { closeMenu(); onExportCSV(); }} className={sideBtn}><Download size={18}/> Export CSV</button>
      <Link to="/" title="Public citizen view" onClick={closeMenu} className={`${sideBtn} no-underline`}><UserCheck size={18}/> Citizen view</Link>
    </div>
  );

  const userCard = (
    <div className="rounded-lg bg-white/5 p-3">
      <div className="truncate text-sm font-semibold text-white">{effectiveUser?.name || 'Municipality Official'}</div>
      <div className="text-xs text-slate-400">{effectiveUser?.role || 'Official'}</div>
      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-300" role="status">
        <Activity size={13} aria-hidden="true" /> <span>{socketStatus}</span>
      </div>
      <button
        onClick={() => { closeMenu(); onLogout(); }}
        className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-rose-500/15 px-3 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/25 hover:text-white border-0"
      >
        <LogOut size={16}/> Sign out
      </button>
    </div>
  );

  const brand = (
    <Link to="/command-center/dashboard" onClick={closeMenu} className="flex items-center gap-3 rounded-lg no-underline">
      <span className="grid size-10 place-items-center rounded-xl bg-blue-600"><Building2 size={20} className="text-white"/></span>
      <span className="leading-tight">
        <span className="block font-display text-base font-extrabold tracking-tight text-white">CivicAI</span>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Command Center</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-canvas text-navy lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-navy p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
        {brand}
        <div className="flex-1 space-y-6">
          {navLinks}
          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0">Tools</p>
            {toolbox}
          </div>
        </div>
        {userCard}
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-50 bg-navy lg:hidden">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4">
          {brand}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="cc-mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="grid size-11 place-items-center rounded-lg text-white transition-colors hover:bg-white/10 border-0 bg-transparent"
          >
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
        {menuOpen && (
          <div id="cc-mobile-menu" className="max-h-[calc(100vh-4rem)] space-y-4 overflow-y-auto border-t border-white/10 px-4 pb-4 pt-3">
            {navLinks}
            {toolbox}
            {userCard}
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
