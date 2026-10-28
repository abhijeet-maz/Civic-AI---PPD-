import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Check, AlertTriangle, RefreshCw } from 'lucide-react';

export function LocationPicker({ initialLat = 20.3587, initialLng = 85.8333, initialAddress = '', onConfirmLocation }) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [address, setAddress] = useState(initialAddress || 'Patia, Bhubaneswar, Odisha');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [source, setSource] = useState('PIN');
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const mapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);

  // Check if Google Maps JS API key is configured
  const googleApiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (!googleApiKey) return undefined;
    if (window.google && window.google.maps) {
      initGoogleMap();
      return undefined;
    }
    // Maps script (index.html) is still loading: initialise as soon as it is ready
    const onReady = () => initGoogleMap();
    window.addEventListener('gmaps:ready', onReady);
    return () => window.removeEventListener('gmaps:ready', onReady);
  }, [googleApiKey]);

  const initGoogleMap = () => {
    if (!mapContainerRef.current) return;
    try {
      const locationPos = { lat: Number(lat), lng: Number(lng) };
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: locationPos,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false
      });
      googleMapRef.current = map;

      const marker = new window.google.maps.Marker({
        position: locationPos,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Drag to exact problem location'
      });
      markerRef.current = marker;

      marker.addListener('dragend', (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setLat(newLat);
        setLng(newLng);
        setSource('PIN');
        reverseGeocode(newLat, newLng);
      });

      setMapsLoaded(true);
    } catch (err) {
      console.warn('Google Maps initialization failed fallback to canvas grid:', err);
    }
  };

  // Reverse geocoding helper (OSM Nominatim API if Google Places key is not set)
  const reverseGeocode = async (targetLat, targetLng) => {
    setIsGeocoding(true);
    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat: targetLat, lng: targetLng } });
        if (response.results && response.results[0]) {
          setAddress(response.results[0].formatted_address);
          setIsGeocoding(false);
          return;
        }
      }
      
      // Fallback open reverse geocode API
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${targetLat}&lon=${targetLng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`Location (${targetLat.toFixed(4)}, ${targetLng.toFixed(4)})`);
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setAddress(`Location Coordinates: ${targetLat.toFixed(4)}, ${targetLng.toFixed(4)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Forward geocode / search location
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const match = data[0];
        const newLat = parseFloat(match.lat);
        const newLng = parseFloat(match.lon);
        setLat(newLat);
        setLng(newLng);
        setAddress(match.display_name);
        setSource('SEARCH');

        if (googleMapRef.current && markerRef.current) {
          const pos = { lat: newLat, lng: newLng };
          googleMapRef.current.setCenter(pos);
          markerRef.current.setPosition(pos);
        }
      }
    } catch (err) {
      console.error('Search location error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Get GPS Location
  const handleUseGPS = () => {
    if (navigator.geolocation) {
      setIsGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setLat(newLat);
          setLng(newLng);
          setSource('GPS');
          if (googleMapRef.current && markerRef.current) {
            const position = { lat: newLat, lng: newLng };
            googleMapRef.current.setCenter(position);
            markerRef.current.setPosition(position);
          }
          reverseGeocode(newLat, newLng);
        },
        (err) => {
          console.warn('Geolocation permission denied or unavailable:', err);
          setIsGeocoding(false);
        }
      );
    }
  };

  // Manual Canvas Marker Drag Interaction for fallback interactive map
  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Map bounding box around Bhubaneswar (20.25 to 20.45 Lat, 85.75 to 85.90 Lng)
    const newLat = 20.45 - (y / rect.height) * 0.20;
    const newLng = 85.75 + (x / rect.width) * 0.15;

    setLat(Number(newLat.toFixed(6)));
    setLng(Number(newLng.toFixed(6)));
    setSource('PIN');
    reverseGeocode(newLat, newLng);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search Bar & Current Location Button */}
      <form onSubmit={handleSearchLocation} style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.4rem 0.75rem' }}>
          <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
          <input
            type="text"
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search address, landmark or area..."
          />
        </div>
        <button
          type="submit"
          style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid var(--accent-blue)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleUseGPS}
          style={{ background: 'rgba(6, 182, 212, 0.18)', border: '1px solid var(--accent-cyan)', color: '#fff', padding: '0.5rem 0.85rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Navigation size={15} color="var(--accent-cyan)" /> GPS
        </button>
      </form>

      {/* Map Container */}
      <div style={{ position: 'relative', height: '260px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#090d16' }}>
        {googleApiKey ? (
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          /* Interactive SVG Canvas Map Fallback */
          <div
            onClick={handleCanvasClick}
            style={{ width: '100%', height: '100%', position: 'relative', cursor: 'crosshair', background: '#0a0f1d' }}
          >
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <pattern id="pickerGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pickerGrid)" />
              <path d="M 30 140 Q 180 80 340 200" fill="none" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="4" />
              <path d="M 120 20 Q 220 180 420 220" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="3" />
            </svg>

            {/* Draggable Marker Representation */}
            <div
              style={{
                position: 'absolute',
                left: `${Math.max(10, Math.min(90, ((lng - 85.75) / 0.15) * 100))}%`,
                top: `${Math.max(10, Math.min(90, ((20.45 - lat) / 0.20) * 100))}%`,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ filter: 'drop-shadow(0 4px 10px rgba(239, 68, 68, 0.7))', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MapPin size={34} color="#ef4444" fill="#ef4444" />
                <div style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', marginTop: '-4px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Click to position pin
                </div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
              📍 Drag pin / click map to refine location
            </div>
          </div>
        )}
      </div>

      {/* Selected Address Display Card */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>SELECTED COMPLAINT LOCATION ({source})</span>
          {isGeocoding && <RefreshCw size={12} className="animate-spin" color="var(--accent-cyan)" />}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '0.3rem' }}>
          {address || 'Fetching address...'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Lat: {Number(lat).toFixed(6)} • Lng: {Number(lng).toFixed(6)}
        </div>
      </div>

      {/* Confirm Location Action */}
      <button
        type="button"
        className="btn-primary"
        onClick={() => onConfirmLocation({ latitude: Number(lat), longitude: Number(lng), address, source })}
        style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', padding: '0.75rem' }}
      >
        <Check size={18} /> Confirm Exact Problem Location
      </button>
    </div>
  );
}
