'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, X, DoorOpen, BookOpen, UserRound } from 'lucide-react';
import { api } from '@/lib/api';
import { floorShort } from '@/lib/format';

/** Search with autocomplete across halls, courses and teachers. */
export default function SearchBox({ onPickHall, placeholder = 'Search halls, labs, teachers', autoFocus = false, right = null, className = '' }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (q.trim().length < 1) { setRes(null); return undefined; }
    const t = setTimeout(() => { api(`/search?q=${encodeURIComponent(q)}`).then(setRes).catch(() => setRes(null)); }, 180);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const on = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', on);
    return () => document.removeEventListener('pointerdown', on);
  }, []);

  const pick = (code) => { setOpen(false); setQ(''); setRes(null); onPickHall(code); };
  const empty = res && !res.halls.length && !res.courses.length && !res.teachers.length;

  return (
    <div ref={box} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3.5 shadow-sm focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/25">
        <Search size={20} className="shrink-0 text-muted" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} autoFocus={autoFocus}
          placeholder={placeholder} aria-label="Search" className="min-h-[50px] w-full bg-transparent text-[15px] outline-none placeholder:text-muted/80" />
        {q && <button onClick={() => { setQ(''); setRes(null); }} aria-label="Clear search" className="rounded-lg p-1.5 text-muted hover:bg-surface2"><X size={18} /></button>}
        {right}
      </div>
      {open && q && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 max-h-[60vh] animate-pop overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-modal">
          {!res && <div className="px-3 py-4 text-sm text-muted">Searching…</div>}
          {empty && <div className="px-3 py-4 text-sm text-muted">No match for “{q}”. Try a hall code such as B204.</div>}
          {res?.halls.map((h) => (
            <button key={h.code} onClick={() => pick(h.code)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface2 text-brand dark:text-teal"><DoorOpen size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{h.name}</span><span className="block truncate text-xs text-muted">{h.buildingName}, {floorShort(h.level)}</span></span>
              <span className="mono text-xs text-muted">{h.code}</span>
            </button>
          ))}
          {res?.courses.map((c) => (
            <button key={`c${c.courseId}`} onClick={() => pick(c.hallCode)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface2 text-brand dark:text-teal"><BookOpen size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{c.courseCode}: {c.courseTitle}</span><span className="block truncate text-xs text-muted">Usually in {c.hallName}</span></span>
              <span className="mono text-xs text-muted">{c.hallCode}</span>
            </button>
          ))}
          {res?.teachers.map((t) => (
            <div key={t.id} className="rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface2 text-brand dark:text-teal"><UserRound size={18} /></span><span className="text-sm font-semibold">{t.name}</span></div>
              <div className="mt-2 flex flex-wrap gap-2 pl-12">
                {t.halls.map((h) => <button key={h.code} onClick={() => pick(h.code)} className="chip bg-surface2 text-ink hover:bg-line"><span className="mono">{h.code}</span> {h.name}</button>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
