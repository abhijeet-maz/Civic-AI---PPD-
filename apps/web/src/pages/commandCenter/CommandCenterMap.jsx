import React from 'react';
import { GeospatialMap } from '../../components/GeospatialMap.jsx';
import { Map } from 'lucide-react';

export function CommandCenterMap({ incidents, selectedIncident, setSelectedIncident }) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div>
        <div className="eyebrow">Live operations</div>
        <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-slate-900 mb-0">
          <Map size={22} className="shrink-0 text-blue-600" />
          Realtime GIS Command Map
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 mb-0">
          Google Maps powered live incident tracking — click any marker or list item to inspect
        </p>
      </div>

      {/* Map takes the remaining height */}
      <div className="flex min-h-[640px] flex-1 flex-col">
        <GeospatialMap
          incidents={incidents}
          selectedIncident={selectedIncident}
          onSelectIncident={setSelectedIncident}
        />
      </div>
    </div>
  );
}
