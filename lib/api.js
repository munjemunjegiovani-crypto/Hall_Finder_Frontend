// Thin fetch wrapper for the HallFinder backend.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
export const SCHOOL_NAME = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'Horizon International College';
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

const safe = {
  get(k) { try { return window.localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { window.localStorage.setItem(k, v); } catch {} },
  del(k) { try { window.localStorage.removeItem(k); } catch {} },
};
export const store = safe;

export class ApiError extends Error {
  constructor(message, status, data) { super(message); this.status = status; this.data = data; }
}

// ---- Demo clock: lets the app be shown at "Monday 10:01" at any real time -------------
// stored as { base: ISO string, setAt: ms } and ticks forward in real time.
export function getDemoNow() {
  if (typeof window === 'undefined') return null;
  const raw = safe.get('hf_demo');
  if (raw === 'off') return null;
  try {
    if (raw) {
      const { base, setAt } = JSON.parse(raw);
      return new Date(new Date(base).getTime() + (Date.now() - setAt));
    }
  } catch {}
  if (!DEMO_MODE) return null;
  return null; // default preset is applied by DemoClock on first visit
}
export function setDemoClock(isoOrNull) {
  if (!isoOrNull) safe.set('hf_demo', 'off');
  else safe.set('hf_demo', JSON.stringify({ base: isoOrNull, setAt: Date.now() }));
  window.dispatchEvent(new Event('hf-demo-changed'));
}
export function ensureDefaultDemo() {
  if (typeof window === 'undefined' || !DEMO_MODE) return;
  if (safe.get('hf_demo') === null) {
    // Monday 10:01 school time (UTC+1) in the coming week
    setDemoClock(nextMonday(10, 1));
  }
}
// Build an ISO instant for "next Monday at hh:mm in Africa/Douala (UTC+1)". Used only for the demo presets.
export function nextMonday(h, m, dayOffset = 0) {
  const now = new Date();
  const day = now.getUTCDay(); // 0 Sun
  const add = ((1 - day + 7) % 7 || 7) + dayOffset;
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + add, h - 1, m, 0));
  return d.toISOString();
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const t = token ?? safe.get('hf_token');
  if (t) headers.Authorization = `Bearer ${t}`;
  const demo = getDemoNow();
  if (demo) headers['X-Demo-Now'] = demo.toISOString();
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('We could not reach the server. Check your connection and try again.', 0);
  }
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new ApiError(data?.message || 'Something went wrong.', res.status, data);
  return data;
}
