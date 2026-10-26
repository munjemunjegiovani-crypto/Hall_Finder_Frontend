'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Accessibility, Layers, ShieldAlert, X, Navigation } from 'lucide-react';
import FloorMap from '@/components/maps/FloorMap';
import CampusMap from '@/components/maps/CampusMap';
import SearchBox from '@/components/SearchBox';
import HallPanel from '@/components/HallPanel';
import { Spinner, ErrorState } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth, useLocationCtx } from '@/components/Providers';
import { dur, meters } from '@/lib/format';

const LEGEND = [['Free', '#10B981'], ['Busy soon', '#F59E0B'], ['In use', '#EF4444'], ['Closed', '#94A3B8']];

function MapScreen() {
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { loc } = useLocationCtx();
  const [campus, setCampus] = useState(null);
  const [err, setErr] = useState(null);
  const [bCode, setB] = useState(sp.get('b') || null);
  const [floorId, setFloorId] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hereInfo, setHereInfo] = useState(null);
  const [route, setRoute] = useState(null);
  const [mode, setMode] = useState('floor'); // floor | campus
  const [layer, setLayer] = useState('status');
  const [safety, setSafety] = useState(false);
  const [accessible, setAccessible] = useState(!!user?.accessibleRoutes);
  const [layersOpen, setLayersOpen] = useState(false);
  const toCode = sp.get('to');
  const hallParam = sp.get('hall');

  useEffect(() => { api('/campus').then((c) => { setCampus(c); setB((b) => b || 'B'); }).catch(setErr); }, []);

  // location marker
  useEffect(() => {
    if (!loc) return;
    if (['GATE', 'PLAZA'].includes(loc) || loc.startsWith('entrance:')) { setHereInfo({ outdoor: true, code: loc }); return; }
    api(`/halls/${loc}`).then((d) => setHereInfo({ floorId: d.hall.floorId, building: d.hall.building, x: d.hall.doorX, y: d.hall.doorY, code: loc })).catch(() => setHereInfo(null));
  }, [loc]);

  // route preview
  useEffect(() => {
    if (!toCode) { setRoute(null); return; }
    api(`/route?from=${encodeURIComponent(loc)}&to=${toCode}${accessible ? '&accessible=1' : ''}`).then((r) => {
      setRoute(r);
      if (r.from.floorId) { setB(r.from.building); setFloorId(r.from.floorId); setMode('floor'); } else setMode('campus');
    }).catch((e) => { setRoute(null); setErr(e); });
  }, [toCode, loc, accessible]);

  // jump to a hall passed in the URL
  useEffect(() => {
    if (!hallParam || !campus) return;
    api(`/halls/${hallParam}`).then((d) => { setB(d.hall.building); setFloorId(d.hall.floorId); setSelected(d.hall); setMode('floor'); }).catch(() => {});
  }, [hallParam, campus]);

  const building = useMemo(() => campus?.buildings.find((b) => b.code === bCode), [campus, bCode]);
  useEffect(() => {
    if (!building) return;
    if (!building.floors.some((f) => f.id === floorId)) {
      const pref = building.floors.find((f) => f.level === 2) || building.floors[0];
      setFloorId(pref.id);
    }
  }, [building]); // eslint-disable-line
  useEffect(() => { if (floorId) { setMapData(null); api(`/floors/${floorId}/map`).then(setMapData).catch(setErr); } }, [floorId]);

  const pickHall = async (code) => {
    const d = await api(`/halls/${code}`);
    setB(d.hall.building); setFloorId(d.hall.floorId); setSelected(d.hall); setMode('floor');
  };
  const onSelect = async (h) => { const d = await api(`/halls/${h.code}`); setSelected(d.hall); };

  const floorRuns = (route?.paths || []).filter((p) => p.scope === 'indoor' && p.floorId === floorId).map((p) => p.points);
  const outdoorRuns = (route?.paths || []).filter((p) => p.scope === 'outdoor').map((p) => p.points);
  const routeFloors = new Set((route?.paths || []).filter((p) => p.scope === 'indoor').map((p) => p.floorId));
  const here = hereInfo && !hereInfo.outdoor && hereInfo.floorId === floorId ? { x: hereInfo.x, y: hereInfo.y } : route?.from.floorId === floorId ? route.from.point : null;
  const herePoint = hereInfo?.outdoor ? (hereInfo.code === 'GATE' ? { x: 500, y: 570 } : { x: 500, y: 330 }) : null;

  if (err && !campus) return <div className="page py-6"><ErrorState error={err} onRetry={() => location.reload()} /></div>;
  if (!campus || !building) return <Spinner label="Loading the campus" />;

  const clearRoute = () => { router.replace('/app/map'); setRoute(null); };

  return (
    <div className="flex h-[calc(100dvh-64px-60px)] flex-col lg:h-[calc(100dvh-64px)] lg:flex-row">
      {/* desktop side panel */}
      <aside className="hidden w-[380px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-line bg-surface p-4 lg:flex">
        <SearchBox onPickHall={pickHall} placeholder="Find a hall, course or teacher" />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMode('campus')} className={`chip !px-3.5 !py-2 text-sm ${mode === 'campus' ? 'bg-brand text-on-brand' : 'bg-surface2'}`}>Campus</button>
          {campus.buildings.map((b) => <button key={b.code} onClick={() => { setB(b.code); setMode('floor'); }} className={`chip !px-3.5 !py-2 text-sm ${mode === 'floor' && bCode === b.code ? 'bg-brand text-on-brand' : 'bg-surface2'}`}>Building {b.code}</button>)}
        </div>
        <div className="text-sm text-muted">{building.name}, {building.tagline}</div>
        {selected ? <HallPanel hall={selected} onShowRoute={() => router.replace(`/app/map?to=${selected.code}`)} /> : (
          <div className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">Tap any room on the plan to see its status, equipment and next class.</div>
        )}
        <div className="mt-auto space-y-2 border-t border-line pt-4">
          <div className="text-xs font-semibold text-muted">Live status</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">{LEGEND.map(([l, c]) => <span key={l} className="flex items-center gap-1.5 text-xs"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}</span>)}</div>
        </div>
      </aside>

      {/* map area */}
      <div className="relative min-h-0 flex-1">
        {mode === 'floor' ? (
          mapData ? <FloorMap data={mapData} route={floorRuns} here={here} destCode={toCode || selected?.code} selectedCode={selected?.code} onSelect={onSelect} layer={layer} safety={safety} focusKey={`${floorId}-${toCode}-${floorRuns.length}`} className="h-full w-full" fillHeight /> : <Spinner label="Loading floor plan" />
        ) : (
          <CampusMap campus={campus} route={outdoorRuns} herePoint={herePoint} activeBuilding={bCode} destBuilding={route?.to.building} onSelectBuilding={(c) => { setB(c); setMode('floor'); }} className="h-full w-full" />
        )}

        {/* top overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-3 pr-[68px]">
          <div className="pointer-events-auto lg:hidden"><SearchBox onPickHall={pickHall} placeholder="Find a hall" /></div>
          <div className="pointer-events-auto scroll-hide flex gap-2 overflow-x-auto lg:hidden">
            <button onClick={() => setMode('campus')} className={`chip shrink-0 !px-3.5 !py-2 text-sm shadow-sm ${mode === 'campus' ? 'bg-brand text-on-brand' : 'bg-surface'}`}>Campus</button>
            {campus.buildings.map((b) => <button key={b.code} onClick={() => { setB(b.code); setMode('floor'); }} className={`chip shrink-0 !px-3.5 !py-2 text-sm shadow-sm ${mode === 'floor' && bCode === b.code ? 'bg-brand text-on-brand' : 'bg-surface'}`}>Building {b.code}</button>)}
          </div>
          {route && (
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-surface/95 p-2.5 pl-4 shadow-float backdrop-blur">
              <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">Route to {route.to.name}</div><div className="mono text-xs text-muted">{meters(route.distanceM)}, {dur(route.durationSec)}{route.usesStairs ? ', stairs' : ', step-free'}</div></div>
              <Link href={`/app/navigate?to=${route.to.code}`} className="btn-teal !min-h-[40px] !px-3 text-sm"><Navigation size={16} />Start</Link>
              <button onClick={clearRoute} className="rounded-lg p-2 text-muted hover:bg-surface2" aria-label="Clear route"><X size={18} /></button>
            </div>
          )}
        </div>

        {/* floor switcher */}
        {mode === 'floor' && (
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-row-reverse gap-1 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-float backdrop-blur" role="group" aria-label="Floors">
            {[...building.floors].reverse().map((f) => (
              <button key={f.id} onClick={() => { setFloorId(f.id); setSelected(null); }} aria-label={f.name} aria-pressed={f.id === floorId}
                className={`mono relative flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold transition ${f.id === floorId ? 'bg-brand text-on-brand' : 'text-muted hover:bg-surface2'}`}>
                {f.label}
                {routeFloors.has(f.id) && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-teal" />}
                {hereInfo?.floorId === f.id && <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-[#06B6D4] ring-2 ring-surface" />}
              </button>
            ))}
          </div>
        )}

        {/* layers */}
        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-2">
          {layersOpen && (
            <div className="animate-pop w-56 rounded-2xl border border-line bg-surface p-3 text-sm shadow-float">
              <label className="flex items-center justify-between py-1.5"><span>Live hall status</span><input type="checkbox" className="h-5 w-5 accent-[rgb(var(--teal))]" checked={layer === 'status'} onChange={(e) => setLayer(e.target.checked ? 'status' : 'type')} /></label>
              <label className="flex items-center justify-between py-1.5"><span className="flex items-center gap-1.5"><ShieldAlert size={15} className="text-bad" />Safety and exits</span><input type="checkbox" className="h-5 w-5 accent-[rgb(var(--teal))]" checked={safety} onChange={(e) => setSafety(e.target.checked)} /></label>
              <label className="flex items-center justify-between py-1.5"><span className="flex items-center gap-1.5"><Accessibility size={15} />Step-free routes</span><input type="checkbox" className="h-5 w-5 accent-[rgb(var(--teal))]" checked={accessible} onChange={(e) => setAccessible(e.target.checked)} /></label>
            </div>
          )}
          <button onClick={() => setLayersOpen(!layersOpen)} className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface/95 px-3.5 text-sm font-semibold shadow-float backdrop-blur" aria-expanded={layersOpen}><Layers size={18} />Layers</button>
        </div>

        {/* mobile sheet */}
        {selected && (
          <div className="absolute inset-x-0 bottom-0 max-h-[62%] overflow-y-auto rounded-t-3xl border-t border-line bg-surface p-4 pb-5 shadow-modal lg:hidden">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
            <button onClick={() => setSelected(null)} className="absolute right-3 top-3 rounded-lg p-2 text-muted" aria-label="Close"><X size={18} /></button>
            <HallPanel hall={selected} onShowRoute={() => router.replace(`/app/map?to=${selected.code}`)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() { return <Suspense fallback={<Spinner label="Loading map" />}><MapScreen /></Suspense>; }
