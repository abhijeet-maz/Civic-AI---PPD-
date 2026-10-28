import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, Plus, Sparkles, Building2, Activity, ChevronRight, Menu, X } from 'lucide-react';

const navLink = (active) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export function CitizenLayout({ socketStatus, onOpenReportModal, onOpenAiAssistantModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-navy">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1440px] items-center gap-2 px-4 sm:px-6">
          <Link to="/" onClick={closeMenu} className="mr-auto flex items-center gap-3 rounded-lg no-underline">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-700 shadow-sm">
              <Shield size={21} className="text-white" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-extrabold tracking-tight text-navy">CivicAI</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:block">Smart civic services</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            <Link to="/" className={navLink(pathname === '/')}>Home</Link>
            <a href="#track-section" className={navLink(false)}>Track Complaint</a>
          </nav>

          <div
            className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 xl:flex"
            role="status"
          >
            <Activity size={14} aria-hidden="true" />
            <span>{socketStatus}</span>
          </div>

          <button onClick={onOpenAiAssistantModal} className="btn btn-secondary btn-sm hidden whitespace-nowrap md:inline-flex">
            <Sparkles size={15} /> AI Assistant
          </button>

          <Link to="/command-center/login" className="btn btn-secondary btn-sm hidden whitespace-nowrap no-underline md:inline-flex">
            <Building2 size={15} /> Staff Portal
          </Link>

          <button onClick={onOpenReportModal} className="btn btn-primary btn-sm whitespace-nowrap">
            <Plus size={16} /> <span>Report Issue</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm w-10 px-0 md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="citizen-mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile / tablet menu */}
        {menuOpen && (
          <div id="citizen-mobile-menu" className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              <Link to="/" onClick={closeMenu} className={`${navLink(pathname === '/')} min-h-11 content-center`}>Home</Link>
              <a href="#track-section" onClick={closeMenu} className={`${navLink(false)} min-h-11 content-center`}>Track Complaint</a>
              <button
                onClick={() => { closeMenu(); onOpenAiAssistantModal(); }}
                className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-0 bg-transparent"
              >
                <Sparkles size={16} /> AI Assistant
              </button>
              <Link
                to="/command-center/login"
                onClick={closeMenu}
                className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 no-underline hover:bg-slate-100 hover:text-slate-900"
              >
                <Building2 size={16} /> Staff Portal
              </Link>
            </nav>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-800" role="status">
              <Activity size={14} aria-hidden="true" /> <span>{socketStatus}</span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-5 sm:px-7">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} CivicAI · Smart civic issue reporting & resolution</span>
          <span className="flex items-center gap-1">Trusted municipal service <ChevronRight size={13} /></span>
        </div>
      </footer>
    </div>
  );
}
