'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

/** GET helper with loading/error state. Re-fetches when the demo clock changes or every `every` ms. */
export function useFetch(path, { every = 0, enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const alive = useRef(true);
  const load = useCallback(async (quiet) => {
    if (!path || !enabled) return;
    if (!quiet) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api(path);
      if (alive.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (alive.current) setState((s) => ({ data: quiet ? s.data : null, error, loading: false }));
    }
  }, [path, enabled]);
  useEffect(() => {
    alive.current = true;
    load(false);
    const onDemo = () => load(true);
    window.addEventListener('hf-demo-changed', onDemo);
    const id = every ? setInterval(() => load(true), every) : null;
    return () => { alive.current = false; window.removeEventListener('hf-demo-changed', onDemo); if (id) clearInterval(id); };
  }, [load, every]);
  return { ...state, reload: () => load(false), refresh: () => load(true) };
}
