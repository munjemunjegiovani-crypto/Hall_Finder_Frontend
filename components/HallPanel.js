'use client';
import Link from 'next/link';
import { Armchair, Info, Navigation, Projector, Snowflake, Route, Wifi } from 'lucide-react';
import { StatusPill } from '@/components/ui';
import { floorShort, TYPE_LABEL } from '@/lib/format';

const eqIcon = (name) => (/projector|4k/i.test(name) ? Projector : /air|climate|ac/i.test(name) ? Snowflake : /wi-?fi/i.test(name) ? Wifi : Armchair);

/** Compact hall summary used in the map side panel and bottom sheet. */
export default function HallPanel({ hall, onShowRoute, onClose }) {
  if (!hall) return null;
  const nextText = hall.status?.state === 'in_use' && hall.status.current ? `Now: ${hall.status.current.title}` : hall.status?.next ? `Next: ${hall.status.next.title}` : 'No more classes today';
  const nextTime = hall.status?.state === 'in_use' ? `until ${hall.status.until}` : hall.status?.next?.start;
  return (
    <div className="animate-sheet">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono rounded-md bg-surface2 px-2 py-1 text-sm font-bold text-brand dark:text-teal">{hall.code}</span>
            <span className="text-xs text-muted">{TYPE_LABEL[hall.type]}, {floorShort(hall.level)}</span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold leading-tight">{hall.name}</h2>
          <p className="text-sm text-muted">{hall.buildingName}</p>
        </div>
        <StatusPill status={hall.status} />
      </div>
      {hall.kind === 'room' && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-surface2 px-3.5 py-3 text-sm">
          <span className="min-w-0 truncate">{nextText}</span><span className="mono shrink-0 text-xs text-muted">{nextTime}</span>
        </div>
      )}
      {hall.equipment?.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {hall.capacity > 0 && <div className="rounded-xl bg-surface2 p-2.5 text-center"><Armchair size={18} className="mx-auto text-brand dark:text-teal" /><div className="mono mt-1 text-base font-bold">{hall.capacity}</div><div className="text-[11px] text-muted">Seats</div></div>}
          {hall.equipment.slice(0, hall.capacity > 0 ? 2 : 3).map((e) => { const I = eqIcon(e); return <div key={e} className="rounded-xl bg-surface2 p-2.5 text-center"><I size={18} className="mx-auto text-brand dark:text-teal" /><div className="mt-1 line-clamp-2 text-[11px] font-medium leading-tight">{e}</div></div>; })}
        </div>
      )}
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <Link href={`/app/navigate?to=${hall.code}`} className="btn-teal !min-h-[50px] text-[15px]"><Navigation size={18} />Start live navigation</Link>
        <Link href={`/app/halls/${hall.code}`} className="btn-ghost !min-h-[50px] !px-3.5" aria-label="Hall details"><Info size={20} /></Link>
      </div>
      {onShowRoute && <button onClick={onShowRoute} className="btn-soft mt-2 w-full"><Route size={18} />Preview route on the map</button>}
    </div>
  );
}
