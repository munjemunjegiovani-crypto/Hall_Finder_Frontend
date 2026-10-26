'use client';
import { useEffect, useMemo } from 'react';
import { Minus, Plus, LocateFixed } from 'lucide-react';
import usePanZoom from './usePanZoom';
import { statusColor } from '@/components/ui';

const W = 1000, H = 560;
const wrap = (text, max) => {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
};
const typeVar = (t) => `var(--r-${['lecture', 'lab', 'seminar', 'auditorium', 'library', 'cafeteria', 'lounge', 'office', 'restroom', 'stairs', 'elevator', 'exit'].includes(t) ? t : 'office'})`;

function Facility({ h }) {
  const cx = h.x + h.w / 2, cy = h.y + h.h / 2;
  if (h.type === 'stairs') {
    return (
      <g stroke="var(--map-ink)" strokeOpacity=".55" strokeWidth="3" fill="none">
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${cx - 26 + i * 8} ${cy + 36 - i * 14} h${52 - i * 16}`} />)}
        <path d={`M${cx - 20} ${cy + 56} L${cx + 20} ${cy - 40}`} strokeOpacity="0" />
      </g>
    );
  }
  if (h.type === 'elevator') {
    return (
      <g>
        <rect x={cx - 24} y={cy - 28} width="48" height="56" rx="6" fill="none" stroke="var(--map-ink)" strokeOpacity=".6" strokeWidth="3" />
        <path d={`M${cx - 10} ${cy - 6} l10 -12 l10 12 M${cx - 10} ${cy + 6} l10 12 l10 -12`} stroke="var(--map-ink)" strokeOpacity=".7" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  }
  if (h.type === 'restroom') {
    return (
      <g fill="var(--map-ink)" fillOpacity=".6">
        <circle cx={cx - 20} cy={cy - 24} r="8" /><rect x={cx - 29} y={cy - 12} width="18" height="30" rx="7" />
        <circle cx={cx + 20} cy={cy - 24} r="8" /><path d={`M${cx + 9} ${cy - 12} h22 l-4 30 h-14z`} />
      </g>
    );
  }
  return (
    <g>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="#EF4444" className="font-mono">EXIT</text>
      <path d={`M${cx - 22} ${cy + 22} h44 m-10 -8 l10 8 l-10 8`} stroke="#EF4444" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export default function FloorMap({
  data, route = [], activePoints = null, here = null, destCode = null, selectedCode = null,
  onSelect, layer = 'status', safety = false, focusKey = '', className = '', hideControls = false, fillHeight = false,
}) {
  const pz = usePanZoom({ w: W, h: H, min: 0.8, max: 4.5 });
  const halls = data?.halls || [];
  const entrance = data?.nodes?.find((n) => n.kind === 'entrance');
  const dest = halls.find((h) => h.code === destCode);

  // Re-centre when the floor, route or marker changes.
  useEffect(() => {
    const pts = [...route.flat(), ...(here ? [here] : [])];
    if (!pts.length) { pz.reset(); return; }
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    pz.focusBox(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), 180);
  }, [focusKey, data?.floor?.id]); // eslint-disable-line

  const routePaths = useMemo(() => route.map((pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')), [route]);
  const activePath = activePoints?.length > 1 ? activePoints.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ') : null;

  return (
    <div className={`relative overflow-hidden ${fillHeight ? 'h-full' : ''} ${className}`} style={{ background: 'var(--map-bg)' }}>
      <svg ref={pz.svgRef} viewBox={`0 0 ${W} ${H}`} className="h-full w-full touch-none select-none" style={{ cursor: 'grab' }} {...pz.handlers} role="img" aria-label={`Floor plan of ${data?.floor?.buildingName || ''} ${data?.floor?.name || ''}`}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="var(--map-grid)" strokeWidth="1" /></pattern>
          <filter id="glowT" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#grid)" />
        <g transform={pz.transform}>
          {/* building shell */}
          <rect x="26" y="18" width="948" height="524" rx="22" style={{ fill: 'var(--map-shell)', stroke: 'var(--map-wall)' }} strokeWidth="6" />
          <rect x="50" y="245" width="900" height="70" style={{ fill: 'var(--map-corr)' }} />
          <path d="M60 280H940" stroke="var(--map-wall)" strokeOpacity=".7" strokeWidth="2" strokeDasharray="10 12" />

          {/* rooms */}
          {halls.map((h) => {
            const sel = selectedCode === h.code;
            const isDest = destCode === h.code;
            const facility = h.kind === 'facility' && h.type !== 'restroom';
            const isExit = h.type === 'exit';
            const lines = wrap(h.name, Math.floor(h.w / 8.2));
            const tint = layer === 'status' && h.kind === 'room' && h.status ? statusColor(h.status.state) : null;
            return (
              <g key={h.code} onClick={() => { if (!pz.wasDrag()) onSelect?.(h); }} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label={`${h.name}, ${h.code}`}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(h)}>
                <rect x={h.x} y={h.y} width={h.w} height={h.h} rx="12" style={{ fill: typeVar(h.type) }}
                  stroke={sel || isDest ? 'rgb(var(--teal))' : safety && isExit ? '#EF4444' : 'var(--map-wall)'} strokeWidth={sel || isDest ? 5 : safety && isExit ? 4 : 1.5}
                  filter={sel || isDest ? 'url(#glowT)' : undefined} />
                {/* door gap */}
                <rect x={h.doorX - 16} y={h.side === 'N' ? h.y + h.h - 4 : h.y - 2} width="32" height="6" rx="3" style={{ fill: 'var(--map-corr)' }} />
                {h.kind === 'room' ? (
                  <>
                    <text x={h.x + 14} y={h.y + 28} fontSize="19" fontWeight="800" className="font-mono" style={{ fill: 'var(--map-ink)' }}>{h.code}</text>
                    {lines.map((l, i) => <text key={i} x={h.x + 14} y={h.y + 52 + i * 17} fontSize="13.5" fontWeight="600" style={{ fill: 'var(--map-ink)' }} opacity=".82">{l}</text>)}
                    {h.capacity > 0 && <text x={h.x + 14} y={h.y + h.h - 16} fontSize="12" className="font-mono" style={{ fill: 'var(--map-ink)' }} opacity=".6">{h.capacity} seats</text>}
                    {tint && <circle cx={h.x + h.w - 20} cy={h.y + 22} r="8" fill={tint} stroke="var(--map-shell)" strokeWidth="3" />}
                  </>
                ) : (
                  <>
                    <Facility h={h} />
                    <text x={h.x + h.w / 2} y={h.y + 24} textAnchor="middle" fontSize="12.5" fontWeight="700" style={{ fill: 'var(--map-ink)' }} opacity=".75">{h.type === 'restroom' ? 'Restrooms' : h.type === 'stairs' ? 'Stairs' : h.type === 'elevator' ? 'Lift' : ''}</text>
                  </>
                )}
                {safety && isExit && <circle cx={h.x + h.w / 2} cy={h.y + h.h / 2} r="46" fill="#EF4444" opacity=".12" className="animate-pulse" />}
                {facility && false}
              </g>
            );
          })}

          {/* entrance */}
          {entrance && (
            <g>
              <rect x={entrance.x < 500 ? 16 : 972} y="258" width="12" height="44" rx="4" fill="rgb(var(--teal))" />
              <text x={entrance.x < 500 ? 36 : 964} y="334" textAnchor={entrance.x < 500 ? 'start' : 'end'} fontSize="13" fontWeight="700" fill="rgb(var(--teal))">Main entrance</text>
            </g>
          )}

          {/* route */}
          {routePaths.map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke="var(--map-shell)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
              <path d={d} fill="none" stroke="rgb(var(--teal))" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="route-line" />
            </g>
          ))}
          {activePath && <path d={activePath} fill="none" stroke="#06B6D4" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />}

          {/* destination pin */}
          {dest && (
            <g transform={`translate(${dest.doorX} ${dest.side === 'N' ? dest.y + dest.h / 2 : dest.y + dest.h / 2})`} className="animate-bob">
              <path d="M0 -4c-13 0-23 10-23 23 0 17 21 36 22 37a1.7 1.7 0 0 0 2 0c1-1 22-20 22-37 0-13-10-23-23-23Z" transform="translate(0 -46)" fill="#EF4444" stroke="#fff" strokeWidth="3" />
              <circle cx="0" cy="-27" r="8" fill="#fff" />
            </g>
          )}

          {/* you are here */}
          {here && (
            <g transform={`translate(${here.x} ${here.y})`}>
              <circle r="26" fill="#06B6D4" opacity=".28" className="animate-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
              <circle r="15" fill="#06B6D4" opacity=".3" />
              <circle r="9" fill="#06B6D4" stroke="#fff" strokeWidth="4" />
            </g>
          )}
        </g>
      </svg>
      {!hideControls && (
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-ink shadow-float backdrop-blur" onClick={pz.zoomIn} aria-label="Zoom in"><Plus size={20} /></button>
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-ink shadow-float backdrop-blur" onClick={pz.zoomOut} aria-label="Zoom out"><Minus size={20} /></button>
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-teal shadow-float backdrop-blur" onClick={() => {
            const pts = [...route.flat(), ...(here ? [here] : [])];
            if (pts.length) { const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y); pz.focusBox(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), 180); } else pz.reset();
          }} aria-label="Centre map"><LocateFixed size={20} /></button>
        </div>
      )}
    </div>
  );
}
