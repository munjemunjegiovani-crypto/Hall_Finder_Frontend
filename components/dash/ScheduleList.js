'use client';
import Link from 'next/link';
import { Check, CornerUpRight } from 'lucide-react';
import { countdown, floorShort } from '@/lib/format';

const PHASE = {
  passed: ['Passed', 'text-muted'],
  live: ['In progress', 'bg-ok/15 text-[rgb(var(--ok))]'],
  upcoming: [null, ''],
  cancelled: ['Cancelled', 'bg-bad/15 text-[rgb(var(--bad))]'],
};

export default function ScheduleList({ items, nextId, teacher = false }) {
  return (
    <ul className="space-y-2.5">
      {items.map((e) => {
        const isNext = e.id === nextId && e.phase === 'upcoming';
        const [label, tone] = PHASE[e.phase] || [];
        const hot = isNext || e.phase === 'live';
        return (
          <li key={e.id}>
            <Link href={`/app/halls/${e.hallCode}`} className={`flex gap-3 rounded-2xl border bg-surface p-3.5 transition hover:bg-surface2 ${hot ? 'border-teal ring-1 ring-teal/40' : 'border-line'} ${e.phase === 'passed' ? 'opacity-70' : ''}`}>
              <div className="mono w-[58px] shrink-0 text-[13px] leading-5 text-muted">{e.start}<br />{e.end}</div>
              <span className={`w-1 shrink-0 rounded-full ${hot ? 'bg-teal' : 'bg-brand/60'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className={`font-semibold leading-snug ${e.phase === 'cancelled' ? 'line-through' : ''}`}>{e.courseCode}: {e.courseTitle}</div>
                  {e.phase === 'passed' && <Check size={18} className="mt-0.5 shrink-0 text-ok" />}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="mono rounded-md bg-surface2 px-2 py-1 font-semibold">{e.hallCode}</span>
                  <span className="text-muted">{floorShort(e.floorLevel)}, {e.buildingName}</span>
                  {!teacher && e.teacherName && <span className="text-muted">{e.teacherName}</span>}
                  {label && <span className={`chip ${tone}`}>{label}</span>}
                  {isNext && <span className="chip bg-teal-soft text-teal-ink">Next up</span>}
                  {e.phase === 'upcoming' && !isNext && e.startsInMin > 0 && <span className="text-muted">in {countdown(e.startsInMin)}</span>}
                </div>
              </div>
              {e.phase !== 'passed' && e.phase !== 'cancelled' && <span className="self-center rounded-lg p-2 text-brand dark:text-teal" aria-hidden="true"><CornerUpRight size={20} /></span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
