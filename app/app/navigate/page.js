'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowLeftRight, ArrowUp, ArrowUpDown, Check, CornerUpLeft, CornerUpRight, DoorOpen, Flag, Footprints, LogIn, LogOut, Pause, Play, QrCode, RefreshCw, SkipForward, TrendingDown, TrendingUp, Accessibility, Ruler, Timer, Building2 } from 'lucide-react';
import FloorMap from '@/components/maps/FloorMap';
import CampusMap from '@/components/maps/CampusMap';
import { QrScanner } from '@/components/LocationTools';
import { ErrorState, NotFoundArt, Skeleton } from '@/components/ui';
import { api } from '@/lib/api';
import { dur, meters as fm } from '@/lib/format';
import { useAuth, useLocationCtx, useToast } from '@/components/Providers';
import Link from 'next/link';

const ICON = {
  start: Flag, 'turn-left': CornerUpLeft, 'turn-right': CornerUpRight, straight: ArrowUp, cross: ArrowLeftRight,
  'stairs-up': TrendingUp, 'stairs-down': TrendingDown, 'elevator-up': ArrowUpDown, 'elevator-down': ArrowUpDown,
  exit: LogOut, enter: LogIn, outdoor: Footprints, arrive: DoorOpen,
};

function pointAlong(points, t) {
  if (!points?.length) return null;
  if (points.length === 1) return points[0];
  const seg = []; let total = 0;
  for (let i = 1; i < points.length; i++) { const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y); seg.push(d); total += d; }
  let target = total * t;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] || i === seg.length - 1) { const r = seg[i] ? Math.min(1, target / seg[i]) : 0; return { x: points[i].x + (points[i + 1].x - points[i].x) * r, y: points[i].y + (points[i + 1].y - points[i].y) * r }; }
    target -= seg[i];
  }
  return points[points.length - 1];
}

function Navigate() {
  const sp = useSearchParams();
  const to = sp.get('to');
  const router = useRouter();
  const { user } = useAuth();
  const { loc } = useLocationCtx();
  const { toast } = useToast();
  const [accessible, setAccessible] = useState(!!user?.accessibleRoutes);
  const [route, setRoute] = useState(null);
  const [err, setErr] = useState(null);
  const [idx, setIdx] = useState(1);
  const [t, setT] = useState(0);
  const [sim, setSim] = useState(false);
  const [scan, setScan] = useState(false);
  const [maps, setMaps] = useState({});
  const [campus, setCampus] = useState(null);
  const [view, setView] = useState('auto');
  const activeRef = useRef(null);

  const load = useCallback(() => {
    if (!to) return;
    setErr(null);
    api(`/route?from=${encodeURIComponent(loc)}&to=${to}${accessible ? '&accessible=1' : ''}`).then((r) => { setRoute(r); setIdx(r.steps.length > 1 ? 1 : 0); setT(0); }).catch(setErr);
  }, [to, loc, accessible]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { api('/campus').then(setCampus).catch(() => {}); }, []);

  const steps = route?.steps || [];
  const step = steps[idx];
  const last = idx >= steps.length - 1;

  // floor map for the active step
  useEffect(() => {
    if (step?.floorId && !maps[step.floorId]) api(`/floors/${step.floorId}/map`).then((d) => setMaps((m) => ({ ...m, [step.floorId]: d }))).catch(() => {});
  }, [step?.floorId]); // eslint-disable-line

  // walking simulation (demo): about 8 m/s so a long route takes less than a minute
  useEffect(() => {
    if (!sim || !route) return undefined;
    const id = setInterval(() => {
      setT((cur) => {
        const s = route.steps[idx];
        if (!s || idx >= route.steps.length - 1) { setSim(false); return cur; }
        const inc = s.meters > 0 ? 0.8 / s.meters : 0.35;
        if (cur + inc >= 1) { setIdx((i) => Math.min(i + 1, route.steps.length - 1)); return 0; }
        return cur + inc;
      });
    }, 100);
    return () => clearInterval(id);
  }, [sim, route, idx]);

  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [idx]);

  const total = route?.distanceM || 1;
  const done = steps.slice(0, idx).reduce((s, x) => s + x.meters, 0) + (step ? step.meters * t : 0);
  const remainM = Math.max(0, total - done);
  const remainSec = steps.slice(idx + 1).reduce((s, x) => s + x.seconds, 0) + (step ? step.seconds * (1 - t) : 0);
  const pct = Math.min(100, Math.round((done / total) * 100));

  const outdoor = step?.scope === 'outdoor';
  const showCampus = view === 'campus' || (view === 'auto' && outdoor);
  const floorData = step?.floorId ? maps[step.floorId] : null;
  const floorRuns = (route?.paths || []).filter((p) => p.scope === 'indoor' && p.floorId === step?.floorId).map((p) => p.points);
  const outdoorRuns = (route?.paths || []).filter((p) => p.scope === 'outdoor').map((p) => p.points);
  const marker = useMemo(() => (step ? pointAlong(step.points, step.meters > 0 ? t : 0) : null), [step, t]);
  const destHall = route?.to.code;

  const arrive = async () => {
    try { await api(`/recents/${route.to.code}`, { method: 'POST' }); } catch {}
    toast(`You have arrived at ${route.to.name}.`, 'success');
    router.push(`/app/halls/${route.to.code}`);
  };

  if (!to) return <div className="page py-8"><NotFoundArt title="Where to?" text="Pick a hall first, then HallFinder will guide you there." action={<Link href="/app/halls" className="btn-primary">Find a hall</Link>} /></div>;
  if (err) return <div className="page py-8"><ErrorState error={err} onRetry={load} /></div>;
  if (!route) return <div className="page space-y-4 py-6"><Skeleton className="h-28" /><Skeleton className="h-64" /></div>;

  const Icon = ICON[step.kind] || ArrowUp;

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 pb-32 sm:px-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:pb-8">
      <div className="space-y-4">
        {/* header card */}
        <div className="card flex items-center gap-3 p-3.5">
          <button onClick={() => router.back()} className="rounded-xl p-2.5 text-muted hover:bg-surface2" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 animate-pulse rounded-full bg-teal" />Live wayfinding</div>
            <div className="truncate text-lg font-extrabold">Navigating to {route.to.name}</div>
          </div>
          <button onClick={() => router.push('/app/map')} className="rounded-xl bg-bad/10 px-3 py-2 text-sm font-semibold text-bad">Exit</button>
        </div>
        <button onClick={() => setAccessible(!accessible)} className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm ${accessible ? 'border-teal bg-teal-soft text-teal-ink' : 'border-line bg-surface'}`} aria-pressed={accessible}>
          <span className="flex items-center gap-2 font-semibold"><Accessibility size={18} />{accessible ? 'Step-free route active' : 'Use step-free route'}</span>
          <span className="text-xs opacity-80">{accessible ? 'Elevators and ramps only' : route.usesStairs ? 'This route uses stairs' : 'Tap to avoid stairs'}</span>
        </button>

        {/* turn banner */}
        <section className="relative isolate overflow-hidden rounded-3xl p-5 text-white shadow-float" style={{ background: 'linear-gradient(135deg,#0A1A4F,#17318A)' }} aria-live="polite">
          <div className="absolute -right-10 -top-14 -z-10 h-44 w-44 rounded-full bg-teal/25 blur-3xl" />
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal text-white dark:text-[#04201d]"><Icon size={34} strokeWidth={2.4} /></span>
            <div className="min-w-0 flex-1">
              {step.meters > 0 && !last && <span className="chip bg-[#86F2E4] text-[#00403A]"><span className="mono">In {Math.max(1, Math.round(step.meters * (1 - t)))} m</span></span>}
              <h2 className="mt-1.5 text-[22px] font-extrabold leading-tight text-white">{step.text}</h2>
              <p className="mt-1 text-sm text-white/75">{step.detail}</p>
            </div>
          </div>
          {steps[idx + 1] && !last && <p className="mt-4 border-t border-white/15 pt-3 text-sm text-white/80">Then: {steps[idx + 1].text}</p>}
        </section>

        {/* stats */}
        <div className="grid grid-cols-3 gap-3">
          {[[Timer, dur(remainSec), 'Est. arrival'], [Ruler, fm(remainM), 'Remaining'], [Building2, step.level == null ? 'Outside' : step.level === 0 ? 'Ground' : `Floor ${step.level}`, 'You are on']].map(([I, v, l]) => (
            <div key={l} className="card p-3.5"><I size={18} className="text-brand dark:text-teal" /><div className="mono mt-2 text-base font-bold">{v}</div><div className="text-xs text-muted">{l}</div></div>
          ))}
        </div>
        <div className="card p-4">
          <div className="mono mb-2 flex justify-between text-xs text-muted"><span>Journey</span><span>{pct}% (step {Math.min(idx + 1, steps.length)}/{steps.length})</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {/* map */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold">Indoor pathway view</div>
            <div className="inline-flex rounded-lg bg-surface2 p-0.5 text-xs font-semibold">
              {[['auto', 'Follow me'], ['campus', 'Campus']].map(([v, l]) => <button key={v} onClick={() => setView(v)} className={`rounded-md px-2.5 py-1.5 ${view === v ? 'bg-surface shadow-sm' : 'text-muted'}`}>{l}</button>)}
            </div>
          </div>
          <div className="h-[340px] sm:h-[420px]">
            {showCampus && campus ? (
              <CampusMap campus={campus} route={outdoorRuns} herePoint={outdoor ? marker : null} destBuilding={route.to.building} className="h-full w-full" />
            ) : floorData ? (
              <FloorMap data={floorData} route={floorRuns} activePoints={step.points} here={marker} destCode={step.floorId === route.to.floorId ? destHall : null} focusKey={`${step.floorId}-${idx}`} className="h-full w-full" fillHeight />
            ) : <Skeleton className="h-full rounded-none" />}
          </div>
        </section>

        {/* instruction sequence */}
        <section className="card p-4">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-bold">Instruction sequence</h3><span className="mono text-xs text-muted">{steps.length} steps</span></div>
          <ol className="space-y-1.5">
            {steps.map((s, i) => {
              const I = ICON[s.kind] || ArrowUp;
              const state = i < idx ? 'done' : i === idx ? 'active' : 'todo';
              return (
                <li key={s.id} ref={state === 'active' ? activeRef : null}>
                  <button onClick={() => { setIdx(i); setT(0); }} className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${state === 'active' ? 'bg-teal-soft ring-1 ring-teal' : 'hover:bg-surface2'}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${state === 'done' ? 'bg-ok/15 text-[rgb(var(--ok))]' : state === 'active' ? 'bg-brand text-on-brand' : 'bg-surface2 text-muted'}`}>{state === 'done' ? <Check size={18} /> : <I size={18} />}</span>
                    <span className="min-w-0 flex-1"><span className={`block text-sm font-semibold ${state === 'done' ? 'text-muted line-through' : ''}`}>{s.text}</span><span className="block truncate text-xs text-muted">{s.detail}</span></span>
                    <span className="mono shrink-0 text-xs text-muted">{state === 'done' ? 'Passed' : state === 'active' ? 'Now' : s.meters ? fm(s.meters) : ''}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {/* action bar */}
      <div className="fixed inset-x-0 bottom-[60px] z-20 border-t border-line bg-surface/95 p-3 backdrop-blur lg:static lg:col-span-2 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="mx-auto grid max-w-6xl gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <button className="btn-ghost" onClick={load}><RefreshCw size={17} />Recalculate</button>
          <button className="btn-ghost" onClick={() => setScan(true)}><QrCode size={17} />Scan door QR</button>
          <button className={`btn-ghost ${sim ? 'border-teal text-teal-ink' : ''}`} onClick={() => setSim(!sim)}>{sim ? <Pause size={17} /> : <Play size={17} />}{sim ? 'Pause demo walk' : 'Simulate walking'}</button>
          <button className="btn-ghost" onClick={() => { setIdx((i) => Math.min(i + 1, steps.length - 1)); setT(0); }} disabled={last} aria-label="Next step"><SkipForward size={17} />Next</button>
          <button className="btn-teal !min-h-[52px] text-base sm:col-span-4" onClick={arrive}><Check size={20} />I have arrived</button>
        </div>
      </div>
      <QrScanner open={scan} onClose={() => setScan(false)} />
    </div>
  );
}

export default function Page() { return <Suspense fallback={<div className="page py-6"><Skeleton className="h-64" /></div>}><Navigate /></Suspense>; }
