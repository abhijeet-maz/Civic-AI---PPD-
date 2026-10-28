import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation, AlertTriangle, CheckCircle2, Clock, Zap, MapPin, Layers, Filter, X } from 'lucide-react';
import { getSeverityBadgeColor, getStatusBadgeColor, getHumanStatusLabel, formatISTDateTime } from '@civicai/shared';

// ─── Severity & Status colour helpers ──────────────────────────────────────
const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#eab308',
  Low:      '#22c55e',
};

const STATUS_ICONS = {
  Resolved:    '✅',
  'In Progress':'🔵',
  Dispatched:  '🚨',
  Triaged:     '🔶',
  Reported:    '📍',
};

// ─── Dark styled map theme ──────────────────────────────────────────────────
const DARK_MAP_STYLES = [
  { elementType: 'geometry',        stylers: [{ color: '#0f1923' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1923' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#7a8fa8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'poi',             elementType: 'labels.text.fill', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'poi.park',        elementType: 'geometry',         stylers: [{ color: '#10271a' }] },
  { featureType: 'poi.park',        elementType: 'labels.text.fill', stylers: [{ color: '#1d4435' }] },
  { featureType: 'road',            elementType: 'geometry',         stylers: [{ color: '#1a2940' }] },
  { featureType: 'road',            elementType: 'geometry.stroke',  stylers: [{ color: '#0a1929' }] },
  { featureType: 'road',            elementType: 'labels.text.fill', stylers: [{ color: '#4a6080' }] },
  { featureType: 'road.highway',    elementType: 'geometry',         stylers: [{ color: '#1d3557' }] },
  { featureType: 'road.highway',    elementType: 'geometry.stroke',  stylers: [{ color: '#0f2040' }] },
  { featureType: 'road.highway',    elementType: 'labels.text.fill', stylers: [{ color: '#3d6080' }] },
  { featureType: 'transit',         elementType: 'geometry',         stylers: [{ color: '#0a192f' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#2d4a6a' }] },
  { featureType: 'water',           elementType: 'geometry',         stylers: [{ color: '#071924' }] },
  { featureType: 'water',           elementType: 'labels.text.fill', stylers: [{ color: '#1a3a5c' }] },
  { featureType: 'water',           elementType: 'labels.text.stroke', stylers: [{ color: '#071924' }] },
];

// ─── Build SVG marker icon HTML ─────────────────────────────────────────────
function buildMarkerSvg(color, severity, isSelected) {
  const size = isSelected ? 44 : 34;
  const ring = isSelected ? `<circle cx="22" cy="22" r="20" fill="none" stroke="${color}" stroke-width="2.5" opacity="0.5"/>` : '';
  const pulse = severity === 'Critical'
    ? `<circle cx="22" cy="22" r="22" fill="${color}" opacity="0.2"><animate attributeName="r" values="22;32;22" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite"/></circle>`
    : '';
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      ${pulse}
      ${ring}
      <circle cx="22" cy="22" r="${isSelected ? 16 : 13}" fill="${color}" opacity="0.95"/>
      <circle cx="22" cy="22" r="${isSelected ? 14 : 11}" fill="${color}"/>
      <circle cx="22" cy="22" r="${isSelected ? 6 : 5}" fill="white" opacity="0.95"/>
    </svg>`;
}

// ─── Build info window HTML ─────────────────────────────────────────────────
function buildInfoWindowHTML(inc) {
  const color = SEVERITY_COLORS[inc.severity] || '#94a3b8';
  const statusIcon = STATUS_ICONS[inc.status] || '📍';
  return `
    <div style="font-family:'Inter',sans-serif;background:#111827;color:#f1f5f9;border-radius:12px;padding:14px 16px;max-width:290px;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.08);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="background:${color};border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;color:#fff;">${inc.severity}</span>
        <span style="font-size:11px;color:#94a3b8;font-weight:600;">${inc.id}</span>
        <span style="margin-left:auto;font-size:13px;">${statusIcon}</span>
      </div>
      <div style="font-size:13px;font-weight:700;color:#f8fafc;margin-bottom:6px;line-height:1.35;">${inc.title}</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:8px;">📍 ${inc.address}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
        <span style="background:rgba(255,255,255,0.07);border-radius:4px;padding:2px 7px;font-size:10px;color:#94a3b8;font-weight:600;">${inc.category}</span>
        <span style="background:rgba(255,255,255,0.07);border-radius:4px;padding:2px 7px;font-size:10px;color:#94a3b8;font-weight:600;">${inc.status}</span>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:8px;display:flex;justify-content:space-between;font-size:10px;color:#64748b;">
        <span>🏢 ${inc.assignedDepartment || '—'}</span>
        <span>👆 ${inc.upvotes || 0} upvotes</span>
      </div>
      ${inc.aiAnalysis ? `
      <div style="margin-top:8px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:8px;padding:7px 10px;">
        <div style="font-size:10px;color:#06b6d4;font-weight:700;margin-bottom:2px;">🤖 AI Analysis</div>
        <div style="font-size:11px;color:#94a3b8;">${inc.aiAnalysis.detectedIssue || ''} <span style="color:#06b6d4;">(${Math.round((inc.aiAnalysis.confidence || 0)*100)}%)</span></div>
      </div>` : ''}
    </div>`;
}

// Returns {lat,lng} only when both are real numbers. Mongo/legacy documents can have missing, null
// or string coordinates; one bad value used to throw inside new google.maps.Map() and blank the map.
const toLatLng = (inc) => {
  const lat = Number(inc?.lat ?? inc?.location?.latitude);
  const lng = Number(inc?.lng ?? inc?.location?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) ? { lat, lng } : null;
};

// ─── No API key placeholder ─────────────────────────────────────────────────
function NoApiKeyPlaceholder({ incidents, selectedIncident, onSelectIncident, problem }) {
  const valid = incidents.map(toLatLng).filter(Boolean);
  const minLat = Math.min(...valid.map(p => p.lat)), maxLat = Math.max(...valid.map(p => p.lat));
  const minLng = Math.min(...valid.map(p => p.lng)), maxLng = Math.max(...valid.map(p => p.lng));
  const spanLat = (maxLat - minLat) || 0.01, spanLng = (maxLng - minLng) || 0.01;
  return (
    <div style={{ flex: 1, background: '#090d16', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Decorative grid */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <pattern id="gmap-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>
          <radialGradient id="gmap-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gmap-grid)"/>
        <rect width="100%" height="100%" fill="url(#gmap-glow)"/>
        {/* Fake streets */}
        <path d="M 60 200 Q 300 150 600 200 T 1100 180" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="3" strokeDasharray="8 4"/>
        <path d="M 100 350 Q 400 300 750 360" fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="2"/>
        <path d="M 200 100 L 200 600" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5"/>
        <path d="M 450 80 L 450 620" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5"/>
        <path d="M 750 80 L 750 620" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5"/>
      </svg>

      {/* API key notice */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 20, textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(11,17,32,0.88)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px', padding: '20px 28px', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🗺️</div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#c7d2fe', marginBottom: '6px' }}>{problem?.title || 'Google Maps API Key Required'}</div>
          <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '340px', lineHeight: 1.5 }}>
            {problem ? problem.detail : (<>
              Replace <code style={{ color: '#a5b4fc', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>YOUR_GOOGLE_MAPS_API_KEY</code> in<br/>
              <code style={{ color: '#94a3b8' }}>apps/web/index.html</code> to activate the live map.
            </>)}
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#475569' }}>
            Incident pins are still rendered below (preview mode)
          </div>
        </div>
      </div>

      {/* Incident pins overlaid on decorative canvas */}
      {incidents.map((inc, idx) => {
        const pos = toLatLng(inc);
        if (!pos) return null;
        const xPct = 15 + ((pos.lng - minLng) / spanLng) * 70;
        const yPct = 15 + ((maxLat - pos.lat) / spanLat) * 70;
        const color = SEVERITY_COLORS[inc.severity] || '#94a3b8';
        const isSelected = selectedIncident?.id === inc.id;
        return (
          <div
            key={inc.id}
            onClick={() => onSelectIncident(inc)}
            style={{
              position: 'absolute',
              left: `${Math.max(8, Math.min(88, xPct))}%`,
              top:  `${Math.max(8, Math.min(85, yPct))}%`,
              transform: 'translate(-50%,-50%)',
              zIndex: isSelected ? 30 : 15,
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {inc.severity === 'Critical' && (
              <div style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: color, opacity: 0.3, animation: 'ping 2s ease-in-out infinite', top: -12, left: -12 }}/>
            )}
            <div style={{
              width: isSelected ? 36 : 28, height: isSelected ? 36 : 28,
              borderRadius: '50%', background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', border: `${isSelected ? 3 : 2}px solid rgba(255,255,255,0.9)`,
              boxShadow: isSelected ? `0 0 28px ${color}, 0 4px 16px rgba(0,0,0,0.6)` : `0 0 12px ${color}55, 0 2px 8px rgba(0,0,0,0.5)`,
              fontSize: 12, fontWeight: 700,
            }}>
              {inc.severity === 'Critical' ? <AlertTriangle size={13}/> : <MapPin size={11}/>}
            </div>
            <div style={{
              position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(9,13,22,0.92)', border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.08)'}`,
              padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', fontSize: '0.68rem',
              fontWeight: 600, color: '#e2e8f0', pointerEvents: 'none', marginTop: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
              {inc.id}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main GoogleMap component ───────────────────────────────────────────────
function GoogleMapView({ incidents, selectedIncident, onSelectIncident }) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const markersRef = useRef({});
  const infoWinRef = useRef(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;
    if (mapObj.current) return; // create the Map only once; markers are refreshed by placeMarkers()
    try {
    const valid = incidents.map(toLatLng).filter(Boolean);
    const center = valid.length
      ? { lat: valid.reduce((s,p)=>s+p.lat,0)/valid.length, lng: valid.reduce((s,p)=>s+p.lng,0)/valid.length }
      : { lat: 37.7749, lng: -122.4194 };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      styles: DARK_MAP_STYLES,
      disableDefaultUI: false,
      zoomControl: true,
      zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: { position: window.google.maps.ControlPosition.RIGHT_TOP },
      backgroundColor: '#0f1923',
    });

    mapObj.current = map;
    infoWinRef.current = new window.google.maps.InfoWindow({
      pixelOffset: new window.google.maps.Size(0, -10),
      maxWidth: 310,
    });

    // Style the info window background
    window.google.maps.event.addListener(infoWinRef.current, 'domready', () => {
      const iwBg = document.querySelector('.gm-style-iw');
      const iwClose = document.querySelector('.gm-ui-hover-effect');
      if (iwBg) {
        iwBg.style.background = '#111827';
        iwBg.style.border = '1px solid rgba(255,255,255,0.1)';
        iwBg.style.borderRadius = '12px';
        iwBg.style.padding = '0';
        iwBg.style.overflow = 'visible';
        const iwBgOuter = iwBg.previousSibling;
        if (iwBgOuter) { try { iwBgOuter.style.display = 'none'; } catch(_) {} }
      }
      if (iwClose) {
        iwClose.style.background = 'rgba(255,255,255,0.1)';
        iwClose.style.borderRadius = '50%';
        iwClose.style.top = '4px';
        iwClose.style.right = '4px';
      }
    });

    placeMarkers(map);
    } catch (err) {
      // an exception inside a React effect would unmount the whole page - report it instead
      mapObj.current = null;
      console.error('[GeospatialMap] Google Maps failed to initialise:', err);
      window.dispatchEvent(new CustomEvent('gmaps:initerror', { detail: String(err?.message || err) }));
    }
  }, [incidents]);

  const placeMarkers = useCallback((map) => {
    const gmap = map || mapObj.current;
    if (!gmap || !window.google) return;

    // Clear existing
    Object.values(markersRef.current).forEach(m => m.setMap(null));
    markersRef.current = {};

    incidents.forEach(inc => {
      const pos = toLatLng(inc);
      if (!pos) return;
      const isSelected = selectedIncident?.id === inc.id;
      const color = SEVERITY_COLORS[inc.severity] || '#94a3b8';

      const iconSvg = buildMarkerSvg(color, inc.severity, isSelected);
      const blob = new Blob([iconSvg], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      const sz   = isSelected ? 44 : 34;

      const marker = new window.google.maps.Marker({
        position: pos,
        map: gmap,
        icon: { url, scaledSize: new window.google.maps.Size(sz, sz), anchor: new window.google.maps.Point(sz/2, sz/2) },
        title: inc.title,
        zIndex: isSelected ? 999 : (inc.severity === 'Critical' ? 100 : 50),
        animation: isSelected ? window.google.maps.Animation.BOUNCE : null,
      });

      marker.addListener('click', () => {
        onSelectIncident(inc);
        if (infoWinRef.current) {
          infoWinRef.current.setContent(buildInfoWindowHTML(inc));
          infoWinRef.current.open(gmap, marker);
        }
        setTimeout(() => marker.setAnimation(null), 1400);
      });

      markersRef.current[inc.id] = marker;
    });
  }, [incidents, selectedIncident, onSelectIncident]);

  // Init map when Google Maps API is ready
  useEffect(() => {
    if (window.__gmapsReady && window.google) {
      initMap();
    } else {
      const handler = () => initMap();
      window.addEventListener('gmaps:ready', handler);
      return () => window.removeEventListener('gmaps:ready', handler);
    }
  }, [initMap]);

  // Re-place markers when selection changes
  useEffect(() => {
    if (mapObj.current && window.google) {
      placeMarkers(mapObj.current);
      // Pan to selected
      const selPos = toLatLng(selectedIncident);
      if (selPos) {
        mapObj.current.panTo(selPos);
        const marker = markersRef.current[selectedIncident.id];
        if (marker && infoWinRef.current) {
          infoWinRef.current.setContent(buildInfoWindowHTML(selectedIncident));
          infoWinRef.current.open(mapObj.current, marker);
        }
      }
    }
  }, [selectedIncident, placeMarkers]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '440px', borderRadius: '12px' }}/>;
}

// ─── Incident sidebar card ──────────────────────────────────────────────────
function SidebarCard({ inc, isSelected, onClick }) {
  const color = SEVERITY_COLORS[inc.severity] || '#94a3b8';
  return (
    <div
      onClick={() => onClick(inc)}
      style={{
        background: isSelected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
        transition: 'all 0.2s ease', marginBottom: '6px',
        boxShadow: isSelected ? '0 0 16px rgba(59,130,246,0.15)' : 'none',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }}/>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>{inc.id}</span>
        <span style={{ marginLeft: 'auto', fontSize: '10px', background: `${color}22`, color, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{inc.severity}</span>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3, marginBottom: '4px' }}>
        {inc.title.length > 38 ? inc.title.slice(0, 38) + '…' : inc.title}
      </div>
      <div style={{ fontSize: '10px', color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
        <MapPin size={9}/> {inc.address.length > 36 ? inc.address.slice(0, 36) + '…' : inc.address}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
        <span style={{ fontSize: '10px', color: '#64748b' }}>{STATUS_ICONS[inc.status] || '📍'} {inc.status}</span>
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#475569' }}>👆 {inc.upvotes}</span>
      </div>
    </div>
  );
}

// ─── Legend pill ────────────────────────────────────────────────────────────
function LegendPill({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }}/>
      {label}
    </div>
  );
}

// ─── Main exported component ────────────────────────────────────────────────
export function GeospatialMap({ incidents, selectedIncident, onSelectIncident }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [searchTerm,  setSearchTerm]    = useState('');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [mapProblem, setMapProblem] = useState(null);

  // Google calls window.gm_authFailure (see index.html) when it rejects the key; the script tag's
  // onerror reports a blocked/failed download. Show the reason instead of an empty dark box.
  useEffect(() => {
    const authFail = {
      title: 'Google rejected the Maps API key',
      detail: 'In Google Cloud Console: enable "Maps JavaScript API", turn billing on, and allow this site (for example http://localhost:3000/*) in the key\'s HTTP-referrer restrictions. The exact error code is in the browser console.',
    };
    const loadFail = {
      title: 'Google Maps could not be loaded',
      detail: 'maps.googleapis.com is unreachable. Check your internet connection, VPN/firewall or ad blocker, then reload the page.',
    };
    if (window.__gmapsAuthFailed) setMapProblem(authFail);
    else if (window.__gmapsLoadFailed) setMapProblem(loadFail);
    const onAuth = () => setMapProblem(authFail);
    const onLoad = () => setMapProblem(loadFail);
    const onInit = (e) => setMapProblem({ title: 'The map could not start', detail: `${e.detail || 'Unknown error'} - see the browser console for details.` });
    const onReady = () => setMapProblem(null);
    window.addEventListener('gmaps:authfailure', onAuth);
    window.addEventListener('gmaps:loaderror', onLoad);
    window.addEventListener('gmaps:initerror', onInit);
    window.addEventListener('gmaps:ready', onReady);
    const timer = setTimeout(() => { if (!window.__gmapsReady && !window.__gmapsAuthFailed) setMapProblem(loadFail); }, 12000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('gmaps:authfailure', onAuth);
      window.removeEventListener('gmaps:loaderror', onLoad);
      window.removeEventListener('gmaps:initerror', onInit);
      window.removeEventListener('gmaps:ready', onReady);
    };
  }, []);

  // Detect if API key placeholder was not replaced or key is missing/empty
  useEffect(() => {
    const scripts = Array.from(document.querySelectorAll('script[src*="maps.googleapis.com"]'));
    const hasBadKey = scripts.some(s =>
      s.src.includes('YOUR_GOOGLE_MAPS_API_KEY') ||
      s.src.includes('key=&') ||
      s.src.includes('key= &') ||
      /key=\s*&/.test(s.src)
    );
    setApiKeyMissing(hasBadKey);
  }, []);

  const filteredIncidents = incidents.filter(inc => {
    const matchFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'CRITICAL'   && inc.severity === 'Critical') ||
      (activeFilter === 'DISPATCHED' && (inc.status === 'Dispatched' || inc.status === 'In Progress')) ||
      (activeFilter === 'RESOLVED'   && inc.status === 'Resolved');
    const matchSearch = !searchTerm || inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || inc.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const criticalCount  = incidents.filter(i => i.severity === 'Critical').length;
  const activeCount    = incidents.filter(i => ['Dispatched','In Progress'].includes(i.status)).length;
  const resolvedCount  = incidents.filter(i => i.status === 'Resolved').length;

  const FILTERS = [
    { key: 'ALL',        label: `All (${incidents.length})` },
    { key: 'CRITICAL',   label: `🔴 Critical (${criticalCount})` },
    { key: 'DISPATCHED', label: `🔵 Active (${activeCount})` },
    { key: 'RESOLVED',   label: `✅ Resolved (${resolvedCount})` },
  ];

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '560px', padding: 0, background: '#0b0f1d', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* ── Top toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap', zIndex: 20, background: 'rgba(9,13,22,0.9)' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Navigation size={18} color="#06b6d4"/> Realtime Geospatial Command Center
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#475569' }}>
            Live Google Maps • {filteredIncidents.length} incidents in view
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
              background: activeFilter === f.key ? 'rgba(59,130,246,0.25)' : 'transparent',
              border: activeFilter === f.key ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
              color: activeFilter === f.key ? '#93c5fd' : '#64748b',
              padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(v => !v)} title="Toggle incident list" style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
          color: '#94a3b8', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 700,
        }}>
          <Layers size={14}/> {sidebarOpen ? 'Hide' : 'Show'} List
        </button>
      </div>

      {/* ── Map + Sidebar row ── */}
      <div className="flex flex-col md:flex-row" style={{ flex: 1, overflow: 'hidden', minHeight: '460px' }}>

        {/* Map container */}
        <div style={{ flex: 1, position: 'relative', minHeight: '460px', padding: '12px', paddingRight: sidebarOpen ? '6px' : '12px' }}>
          {(apiKeyMissing || mapProblem) ? (
            <NoApiKeyPlaceholder
              problem={apiKeyMissing ? null : mapProblem}
              incidents={filteredIncidents}
              selectedIncident={selectedIncident}
              onSelectIncident={onSelectIncident}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', minHeight: '440px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <GoogleMapView
                incidents={filteredIncidents}
                selectedIncident={selectedIncident}
                onSelectIncident={onSelectIncident}
              />
            </div>
          )}

          {/* Floating legend */}
          <div style={{
            position: 'absolute', bottom: '24px', left: '24px', background: 'rgba(9,13,22,0.88)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px',
            backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 15,
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity Legend</div>
            {Object.entries(SEVERITY_COLORS).map(([sev, col]) => <LegendPill key={sev} label={sev} color={col}/>)}
          </div>

          {/* Stats bar */}
          <div style={{
            position: 'absolute', top: '24px', left: '24px', display: 'flex', gap: '8px', zIndex: 15, flexWrap: 'wrap',
          }}>
            {[
              { label: 'Total', val: incidents.length, color: '#94a3b8' },
              { label: 'Critical', val: criticalCount,  color: '#ef4444' },
              { label: 'Active',   val: activeCount,    color: '#3b82f6' },
              { label: 'Resolved', val: resolvedCount,  color: '#22c55e' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                background: 'rgba(9,13,22,0.88)', border: `1px solid ${color}33`, borderRadius: '8px',
                padding: '5px 10px', backdropFilter: 'blur(12px)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '9px', color: '#475569', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="max-h-[420px] w-full border-t border-white/10 md:max-h-none md:w-[280px] md:min-w-[260px] md:border-l md:border-t-0" style={{
            background: 'rgba(9,13,22,0.7)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Search */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <input
                type="text"
                placeholder="Search incidents…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '7px 10px', color: '#e2e8f0', fontSize: '12px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
              {filteredIncidents.length === 0 && (
                <div style={{ textAlign: 'center', color: '#334155', padding: '30px 0', fontSize: '12px' }}>No incidents match filter</div>
              )}
              {filteredIncidents.map(inc => (
                <SidebarCard
                  key={inc.id}
                  inc={inc}
                  isSelected={selectedIncident?.id === inc.id}
                  onClick={onSelectIncident}
                />
              ))}
            </div>

            {/* Selected detail */}
            {selectedIncident && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 12px', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>{selectedIncident.title}</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>🏢 {selectedIncident.assignedDepartment}</div>
                {selectedIncident.responderUnit && selectedIncident.responderUnit !== 'Unassigned' && (
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>🚒 {selectedIncident.responderUnit}</div>
                )}
                {selectedIncident.aiAnalysis && (
                  <div style={{ marginTop: '8px', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '8px', padding: '7px 9px' }}>
                    <div style={{ fontSize: '10px', color: '#06b6d4', fontWeight: 700 }}>🤖 {selectedIncident.aiAnalysis.detectedIssue}</div>
                    <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{Math.round((selectedIncident.aiAnalysis.confidence || 0) * 100)}% confidence</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
