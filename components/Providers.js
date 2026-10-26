'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, store, ensureDefaultDemo } from '@/lib/api';

/* ---------------- Theme ---------------- */
const ThemeCtx = createContext({ theme: 'light', resolved: 'light', setTheme() {} });
export const useTheme = () => useContext(ThemeCtx);

function applyTheme(mode) {
  const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  return dark ? 'dark' : 'light';
}

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext({ toast() {} });
export const useToast = () => useContext(ToastCtx);

/* ---------------- Auth ---------------- */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

/* ---------------- Location ("You are here") ---------------- */
const LocCtx = createContext({ loc: 'GATE', setLoc() {} });
export const useLocationCtx = () => useContext(LocCtx);

export default function Providers({ children }) {
  const [theme, setThemeState] = useState('system');
  const [resolved, setResolved] = useState('light');
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loc, setLocState] = useState('GATE');

  // theme
  useEffect(() => {
    const saved = store.get('hf_theme') || 'system';
    setThemeState(saved);
    setResolved(applyTheme(saved));
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if ((store.get('hf_theme') || 'system') === 'system') setResolved(applyTheme('system')); };
    mq.addEventListener('change', onChange);
    if (store.get('hf_large') === '1') document.documentElement.classList.add('large-text');
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const setTheme = useCallback((mode) => {
    store.set('hf_theme', mode);
    setThemeState(mode);
    setResolved(applyTheme(mode));
  }, []);

  // toasts
  const toast = useCallback((message, kind = 'info', action) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-2), { id, message, kind, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);

  // auth bootstrap
  useEffect(() => {
    ensureDefaultDemo();
    const l = store.get('hf_loc');
    if (l) setLocState(l);
    const token = store.get('hf_token');
    if (!token) { setReady(true); return; }
    api('/me').then((d) => setUser(d.user)).catch(() => store.del('hf_token')).finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    store.set('hf_token', d.token);
    setUser(d.user);
    return d.user;
  }, []);
  const register = useCallback(async (payload) => {
    const d = await api('/auth/register', { method: 'POST', body: payload });
    store.set('hf_token', d.token);
    setUser(d.user);
    return d.user;
  }, []);
  const logout = useCallback(() => { store.del('hf_token'); setUser(null); }, []);
  const updateMe = useCallback(async (patch) => {
    const d = await api('/me', { method: 'PATCH', body: patch });
    setUser(d.user);
    return d.user;
  }, []);

  const setLoc = useCallback((code) => { store.set('hf_loc', code); setLocState(code); }, []);

  const auth = useMemo(() => ({ user, ready, login, register, logout, updateMe }), [user, ready, login, register, logout, updateMe]);

  return (
    <ThemeCtx.Provider value={{ theme, resolved, setTheme }}>
      <ToastCtx.Provider value={{ toast }}>
        <AuthCtx.Provider value={auth}>
          <LocCtx.Provider value={{ loc, setLoc }}>
            {children}
            <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3" aria-live="polite">
              {toasts.map((t) => (
                <div key={t.id} className={`pointer-events-auto animate-sheet w-full max-w-md rounded-xl border px-4 py-3 text-sm shadow-float backdrop-blur ${
                  t.kind === 'error' ? 'border-bad/40 bg-surface text-ink' : t.kind === 'success' ? 'border-ok/40 bg-surface text-ink' : 'border-line bg-surface text-ink'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${t.kind === 'error' ? 'bg-bad' : t.kind === 'success' ? 'bg-ok' : 'bg-teal'}`} />
                    <div className="flex-1">{t.message}</div>
                    {t.action && <a href={t.action.href} className="font-semibold text-teal-ink">{t.action.label}</a>}
                  </div>
                </div>
              ))}
            </div>
          </LocCtx.Provider>
        </AuthCtx.Provider>
      </ToastCtx.Provider>
    </ThemeCtx.Provider>
  );
}
