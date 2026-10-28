// Diagnoses why evidence / resolution-proof photos do not show.  Run:  npm run check:media
// Reads apps/api/.env, talks to your real Supabase project and (if running) your local API. Prints no secrets.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
require('dotenv').config({ path: path.join(root, 'apps/api/.env') });
const { createClient } = require('@supabase/supabase-js');

const API = process.env.CHECK_API_URL || `http://localhost:${process.env.PORT || 5000}`;
const URL_ = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || '';
let problems = 0;
const ok = (m) => console.log(`  [ OK ] ${m}`);
const bad = (m, fix) => { problems++; console.log(`  [FAIL] ${m}`); if (fix) console.log(`         -> ${fix}`); };
const info = (m) => console.log(`  [info] ${m}`);
const hint = (code) => ({
  ENOTFOUND: 'DNS cannot resolve the Supabase host (no internet, wrong SUPABASE_URL, or DNS/VPN issue).',
  ECONNREFUSED: 'Connection refused - wrong SUPABASE_URL/port or a firewall is blocking it.',
  ETIMEDOUT: 'Timed out - firewall/proxy/college network is blocking outbound HTTPS from Node.',
  UND_ERR_CONNECT_TIMEOUT: 'Timed out - firewall/proxy/college network is blocking outbound HTTPS from Node.',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'TLS inspection (proxy/antivirus) - set NODE_EXTRA_CA_CERTS to your network\'s root certificate file.',
  SELF_SIGNED_CERT_IN_CHAIN: 'TLS inspection (proxy/antivirus) - set NODE_EXTRA_CA_CERTS to your network\'s root certificate file.',
  CERT_HAS_EXPIRED: 'A certificate on the path has expired, or your PC clock is wrong.',
}[code] || 'Node could not reach Supabase.');
const netCode = (e) => { const c = e?.cause || e?.originalError?.cause || e?.originalError; return c?.code || c?.cause?.code || (c?.message && c.message !== e?.message ? c.message : '') || e?.code; };
const get = async (u, opts = {}) => { try { const r = await fetch(u, { redirect: 'manual', ...opts }); return r; } catch (e) { return { error: e }; } };

console.log('\n1) Configuration (apps/api/.env)');
if (!URL_) bad('SUPABASE_URL is empty', 'set it to https://<project-ref>.supabase.co'); else ok(`SUPABASE_URL host: ${new URL(URL_).host}${new URL(URL_).pathname !== '/' ? '   <-- should have NO path!' : ''}`);
if (URL_ && new URL(URL_).pathname !== '/') bad('SUPABASE_URL contains a path', 'use only https://<project-ref>.supabase.co');
if (!KEY) bad('SUPABASE_SERVICE_ROLE_KEY is empty', 'Supabase > Project Settings > API keys > secret / service_role key');
else {
  const kind = KEY.startsWith('sb_secret_') ? 'new-style secret key' : KEY.startsWith('sb_publishable_') ? 'PUBLISHABLE key' : KEY.startsWith('eyJ') ? 'legacy JWT key' : 'unknown format';
  if (KEY.startsWith('sb_publishable_')) bad(`key type: ${kind}`, 'the backend needs the SECRET / service_role key, not the publishable (anon) key');
  else if (KEY.startsWith('eyJ')) { try { const role = JSON.parse(Buffer.from(KEY.split('.')[1], 'base64url').toString()).role; role === 'service_role' ? ok(`key type: ${kind} (role=service_role)`) : bad(`key type: ${kind} with role="${role}"`, 'use the service_role key'); } catch { info(`key type: ${kind}`); } }
  else ok(`key type: ${kind}`);
}
if (!BUCKET) bad('SUPABASE_STORAGE_BUCKET is empty', 'set it to your bucket name'); else ok(`bucket name: ${BUCKET}`);
if (!URL_ || !KEY || !BUCKET) { console.log('\nFix the configuration above first.\n'); process.exit(1); }

console.log('\n2) Can Node reach Supabase?');
const sb = createClient(URL_, KEY, { auth: { persistSession: false } });
const r0 = await get(`${URL_}/storage/v1/bucket`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
if (r0.error) { bad(`request failed: ${r0.error.message} ${netCode(r0.error) ? `(${netCode(r0.error)})` : ''}`, hint(netCode(r0.error))); console.log('\nStopping: nothing else can work until Node can reach Supabase.\n'); process.exit(1); }
if (r0.error) { /* handled above */ } else if (r0.status === 401 || r0.status === 403) bad(`Supabase answered ${r0.status}`, 'the key is wrong or revoked');
else ok(`Supabase storage API answered HTTP ${r0.status}`);

console.log('\n3) Bucket');
let isPublic = null;
const { data: b, error: be } = await sb.storage.getBucket(BUCKET);
if (be) {
  bad(`bucket "${BUCKET}": ${be.message}`, 'the name in SUPABASE_STORAGE_BUCKET must match an existing bucket exactly');
  const { data: all } = await sb.storage.listBuckets(); if (all) info(`buckets in this project: ${all.map((x) => `${x.name}${x.public ? ' (public)' : ' (private)'}`).join(', ') || 'none'}`);
} else { isPublic = b.public; ok(`bucket exists - ${b.public ? 'PUBLIC' : 'PRIVATE'}`); if (!b.public) info('private bucket: photos are shown through signed URLs (/api/upload/view) - this is the correct, secure setup.'); }

console.log('\n4) Stored objects + the exact code path the site uses');
const walk = async (prefix, depth = 0, out = []) => {
  const { data, error } = await sb.storage.from(BUCKET).list(prefix, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) { bad(`cannot list "${prefix}": ${error.message}`); return out; }
  for (const e of data || []) { const p = `${prefix}/${e.name}`; if (e.id) out.push(p); else if (depth < 3 && out.length < 4) await walk(p, depth + 1, out); }
  return out;
};
const files = (await walk('incidents')).slice(0, 3);
if (!files.length) info('no files under incidents/ yet - upload a complaint photo first, then run this again.');
const { getSignedMediaUrl } = await import(path.join(root, 'apps/api/src/services/supabaseStorage.js').replace(/\\/g, '/').replace(/^([A-Za-z]):/, 'file:///$1:'));
for (const f of files) {
  try {
    const signed = await getSignedMediaUrl(f, 60);
    const r = await get(signed);
    const ct = r.headers?.get?.('content-type') || '';
    r.status === 200 && ct.startsWith('image/') ? ok(`signed URL works for ${f} (${ct})`) : bad(`signed URL for ${f} returned HTTP ${r.status} ${ct}`, 'object may be corrupt or not an image');
  } catch (e) { bad(`cannot sign ${f}: ${e.message} ${netCode(e) ? `(${netCode(e)})` : ''}`, netCode(e) ? hint(netCode(e)) : undefined); }
  const pub = await get(`${URL_}/storage/v1/object/public/${BUCKET}/${f}`);
  info(`public URL for the same file -> HTTP ${pub.status ?? 'error'} ${pub.status === 200 ? '(bucket is public)' : '(expected for a private bucket)'}`);
}

console.log('\n5) Your running API + saved complaints  (' + API + ')');
const list = await get(`${API}/api/incidents`, { redirect: 'follow' });
if (list.error || !list.ok) info('API is not running - start it with "npm run dev" and run this again to check the saved complaints.');
else {
  const incidents = (await list.json()).incidents || [];
  const rx = /^https?:\/\/([^/]+)\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(incidents\/[^?#]+)/;
  let checked = 0;
  for (const inc of incidents) for (const [field, u] of [['imageUrl', inc.imageUrl], ['resolutionProofUrl', inc.resolutionProofUrl]]) {
    if (!u || u.startsWith('data:')) continue; const m = u.match(rx);
    if (!m) { info(`${inc.id} ${field}: external URL, shown as-is`); continue; } checked++;
    if (m[1] !== new URL(URL_).host) { bad(`${inc.id} ${field}: stored host ${m[1]} != SUPABASE_URL host`, 'photos were uploaded to a different Supabase project than the one in .env'); continue; }
    if (m[2] !== BUCKET) { bad(`${inc.id} ${field}: stored bucket "${m[2]}" != SUPABASE_STORAGE_BUCKET "${BUCKET}"`, `set SUPABASE_STORAGE_BUCKET=${m[2]} (or re-upload) - signing uses the .env bucket`); continue; }
    const v = await get(`${API}/api/upload/view?path=${encodeURIComponent(decodeURIComponent(m[3]))}`);
    v.status === 302 ? ok(`${inc.id} ${field}: API issues a signed link`) : bad(`${inc.id} ${field}: /api/upload/view -> HTTP ${v.status ?? v.error?.message}`, 'see the API console for "Media signing error"');
  }
  if (!checked) info('no Supabase-hosted photos are saved on any complaint yet.');
}
console.log(problems ? `\n${problems} problem(s) found - fix the [FAIL] lines above.\n` : '\nAll checks passed - photos should display. If not, hard-refresh (Ctrl+F5).\n');
process.exit(problems ? 1 : 0);
