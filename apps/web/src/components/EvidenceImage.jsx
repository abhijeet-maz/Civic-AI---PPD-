import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, Loader2, X, RefreshCw, ZoomIn } from 'lucide-react';

// Evidence / resolution-proof URLs are saved when the file is uploaded and always point at
// Supabase's *public* endpoint (/object/public/...). The bucket is private, so Supabase rejects
// that URL. We keep the stored value untouched and route Supabase object URLs through the API,
// which returns a fresh short-lived signed URL (GET /api/upload/view). Anything else
// (data: URLs, external links) is used as-is.
const STORAGE_OBJECT_URL = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/[^/]+\/(incidents\/[^?#]+)/;

export function resolveMediaSrc(url) {
  if (!url || typeof url !== 'string') return url;
  const match = url.match(STORAGE_OBJECT_URL);
  if (!match) return url;
  let path = match[1];
  try { path = decodeURIComponent(path); } catch { /* keep raw path */ }
  return `/api/upload/view?path=${encodeURIComponent(path)}`;
}

export function EvidenceImage({ src, alt = '', className = '', maxH = 'max-h-72' }) {
  const resolved = resolveMediaSrc(src);
  const [status, setStatus] = useState('loading'); // loading | loaded | error
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false); // 2nd try: the URL exactly as stored (works if the bucket is public)
  const [reason, setReason] = useState('');
  const imgRef = useRef(null);
  const shown = useOriginal ? src : resolved;

  useEffect(() => { setUseOriginal(false); setReason(''); }, [src]);

  useEffect(() => {
    setStatus('loading');
    const el = imgRef.current; // a cached image can finish before React attaches onLoad
    if (el && el.complete && el.naturalWidth > 0) setStatus('loaded');
  }, [shown, attempt]);

  // Both attempts failed: ask the API why (it answers with JSON), so the message is specific
  useEffect(() => {
    if (status !== 'error' || resolved === src) return undefined;
    let cancelled = false;
    fetch(resolved, { redirect: 'manual' })
      .then(async (res) => {
        if (cancelled) return;
        if (res.type === 'opaqueredirect') { setReason('The storage server issued a link but the image could not be downloaded.'); return; }
        if (!res.ok) { const j = await res.json().catch(() => ({})); setReason(`${j.reason || j.error || `Server answered ${res.status}`}${j.code ? ` (${j.code})` : ''}`); }
      })
      .catch(() => { if (!cancelled) setReason('The API could not be reached.'); });
    return () => { cancelled = true; };
  }, [status, resolved, src]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!shown) return null;

  return (
    <>
      <div className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 ${status === 'loading' ? 'min-h-32' : ''} ${className}`}>
        {status === 'loading' && (
          <div className="absolute inset-0 grid animate-pulse place-items-center bg-slate-200" aria-hidden="true">
            <Loader2 size={22} className="animate-spin text-slate-400" />
          </div>
        )}

        {status === 'error' ? (
          <div role="alert" className="flex min-h-28 flex-col items-center justify-center gap-2 p-4 text-center text-sm text-slate-600">
            <ImageOff size={24} aria-hidden="true" />
            <span>Image unavailable{alt ? ` (${alt})` : ''}</span>
            {reason && <span className="max-w-xs text-xs text-slate-500">Reason: {reason}</span>}
            <button type="button" onClick={() => { setUseOriginal(false); setReason(''); setAttempt((a) => a + 1); }} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`View larger: ${alt || 'image'}`}
            className="group relative block w-full cursor-zoom-in border-0 bg-transparent p-0"
          >
            <img
              key={attempt}
              ref={imgRef}
              src={shown}
              alt={alt}
              decoding="async"
              onLoad={() => setStatus('loaded')}
              onError={() => { if (!useOriginal && resolved !== src) { setUseOriginal(true); } else { setStatus('error'); } }}
              className={`mx-auto block h-auto w-auto max-w-full object-contain ${maxH} ${status === 'loaded' ? '' : 'opacity-0'}`}
            />
            {status === 'loaded' && (
              <span className="pointer-events-none absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-slate-900/60 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomIn size={16} aria-hidden="true" />
              </span>
            )}
          </button>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || 'Image preview'}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            autoFocus
            onClick={() => setOpen(false)}
            aria-label="Close preview"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border-0 bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <X size={22} />
          </button>
          <img
            src={shown}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-pop"
          />
        </div>
      )}
    </>
  );
}
