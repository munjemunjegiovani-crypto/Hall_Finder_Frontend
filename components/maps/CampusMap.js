'use client';
import { useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import usePanZoom from './usePanZoom';

const W = 1000, H = 600;

export default function CampusMap({ campus, route = [], hereBuilding = null, herePoint = null, destBuilding = null, activeBuilding = null, onSelectBuilding, className = '', hideControls = false }) {
  const pz = usePanZoom({ w: W, h: H, min: 0.8, max: 3 });
  useEffect(() => {
    const pts = route.flat();
    if (!pts.length) { pz.reset(); return; }
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    pz.focusBox(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), 140);
  }, [JSON.stringify(route)]); // eslint-disable-line
  if (!campus) return null;
  const d = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${Array.isArray(p) ? p[0] : p.x} ${Array.isArray(p) ? p[1] : p.y}`).join(' ');
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: 'var(--map-bg)' }}>
      <svg ref={pz.svgRef} viewBox={`0 0 ${W} ${H}`} className="h-full w-full touch-none select-none" {...pz.handlers} role="img" aria-label="Campus overview map">
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--grass-a)" /><stop offset="1" stopColor="var(--grass-b)" /></linearGradient>
        </defs>
        <g transform={pz.transform}>
          <rect x="-400" y="-300" width="1800" height="1200" fill="url(#cg)" opacity=".55" />
          {/* paths */}
          <g stroke="var(--walk)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M500 590 L500 330" />
            {campus.buildings.map((b) => <path key={b.code} d={d(b.plazaPath)} />)}
          </g>
          <circle cx="500" cy="330" r="86" style={{ fill: 'var(--walk)' }} />
          <circle cx="500" cy="330" r="46" fill="#7DD3FC" opacity=".8" /><circle cx="500" cy="330" r="22" fill="#38BDF8" /><circle cx="500" cy="330" r="7" fill="#fff" />
          <text x="500" y="448" textAnchor="middle" fontSize="15" fontWeight="700" style={{ fill: 'var(--map-ink)' }} opacity=".8">Campus plaza</text>
          {/* gate */}
          <g><rect x="440" y="574" width="120" height="14" rx="4" fill="#0A1A4F" /><rect x="436" y="560" width="10" height="30" rx="3" fill="#0A1A4F" /><rect x="554" y="560" width="10" height="30" rx="3" fill="#0A1A4F" /></g>
          <text x="500" y="552" textAnchor="middle" fontSize="14" fontWeight="700" style={{ fill: 'var(--map-ink)' }}>Main gate</text>
          {/* buildings */}
          {campus.buildings.map((b) => {
            const on = activeBuilding === b.code || destBuilding === b.code;
            return (
              <g key={b.code} onClick={() => { if (!pz.wasDrag()) onSelectBuilding?.(b.code); }} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label={b.name} onKeyDown={(e) => e.key === 'Enter' && onSelectBuilding?.(b.code)}>
                <rect x={b.ox + 8} y={b.oy + 10} width={b.ow} height={b.oh} rx="14" fill="#000" opacity=".16" />
                <rect x={b.ox} y={b.oy} width={b.ow} height={b.oh} rx="14" style={{ fill: 'var(--wall)' }} stroke={on ? 'rgb(var(--teal))' : 'var(--wall-shade)'} strokeWidth={on ? 6 : 3} />
                <rect x={b.ox + 14} y={b.oy + 14} width={b.ow - 28} height={b.oh - 28} rx="8" fill={b.color} opacity=".92" />
                <rect x={b.ox + 14} y={b.oy + 14} width={b.ow - 28} height="18" rx="8" fill="#fff" opacity=".16" />
                <text x={b.ox + b.ow / 2} y={b.oy + b.oh / 2 - 6} textAnchor="middle" fontSize="54" fontWeight="800" fill="#fff" className="font-display">{b.code}</text>
                <text x={b.ox + b.ow / 2} y={b.oy + b.oh / 2 + 28} textAnchor="middle" fontSize="17" fontWeight="600" fill="#fff" opacity=".92">{b.name}</text>
                <rect x={b.ex - 18} y={b.ey - (b.ey > b.oy + b.oh / 2 && b.ey < b.oy + b.oh + 4 ? 0 : 0) - 5} width="36" height="10" rx="4" fill="rgb(var(--teal))" />
              </g>
            );
          })}
          {/* route */}
          {route.map((pts, i) => pts.length > 1 && (
            <g key={i}>
              <path d={d(pts)} fill="none" stroke="var(--map-shell)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
              <path d={d(pts)} fill="none" stroke="rgb(var(--teal))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="route-line" />
            </g>
          ))}
          {herePoint && (
            <g transform={`translate(${herePoint.x} ${herePoint.y})`}>
              <circle r="30" fill="#06B6D4" opacity=".28" className="animate-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
              <circle r="11" fill="#06B6D4" stroke="#fff" strokeWidth="4" />
            </g>
          )}
        </g>
      </svg>
      {!hideControls && (
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-ink shadow-float" onClick={pz.zoomIn} aria-label="Zoom in"><Plus size={20} /></button>
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-ink shadow-float" onClick={pz.zoomOut} aria-label="Zoom out"><Minus size={20} /></button>
        </div>
      )}
    </div>
  );
}
