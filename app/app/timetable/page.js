'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CalendarX, Navigation } from 'lucide-react';
import { useFetch } from '@/lib/hooks';
import { DAYS, DAYS_SHORT, floorShort } from '@/lib/format';
import { EmptyState, ErrorState, PageTitle, Skeleton } from '@/components/ui';

export default function TimetablePage() {
  const { data, error, loading, reload } = useFetch('/timetable', { every: 60000 });
  const [pick, setPick] = useState(null);
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data) return <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>;
  const today = data.clock.day;
  const day = pick ?? today;
  const byDay = (d) => data.entries.filter((e) => e.day === d).sort((a, b) => a.startMin - b.startMin);
  const list = byDay(day);
  const mins = data.clock.minutes;
  return (
    <div>
      <PageTitle title="Timetable" sub="Tap a class to see its hall, or get directions straight away." />
      <div className="scroll-hide -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Day of week">
        {[1, 2, 3, 4, 5, 6].map((d) => (
          <button key={d} role="tab" aria-selected={day === d} onClick={() => setPick(d)}
            className={`relative min-w-[64px] shrink-0 rounded-2xl border px-4 py-2.5 text-center transition ${day === d ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface hover:bg-surface2'}`}>
            <div className="text-xs opacity-80">{DAYS_SHORT[d]}</div>
            <div className="text-sm font-bold">{byDay(d).length} {byDay(d).length === 1 ? 'class' : 'classes'}</div>
            {d === today && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-teal" aria-label="Today" />}
          </button>
        ))}
      </div>
      <h2 className="mb-3 text-lg font-bold">{DAYS[day]}{day === today ? ', today' : ''}</h2>
      {list.length === 0 ? (
        <EmptyState icon={CalendarX} title="No classes this day" text="Enjoy the free time. The study halls and library are open." action={<Link href="/app/halls?type=library" className="btn-soft">Find a study space</Link>} />
      ) : (
        <ul className="space-y-3">
          {list.map((e) => {
            const live = day === today && e.startMin <= mins && mins < e.endMin && e.status !== 'cancelled';
            const passed = day === today && e.endMin <= mins;
            return (
              <li key={e.id} className={`card flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${live ? 'ring-2 ring-teal' : ''} ${passed ? 'opacity-60' : ''}`}>
                <div className="mono w-[78px] shrink-0 text-sm text-muted">{e.start}<br />{e.end}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-semibold ${e.status === 'cancelled' ? 'line-through' : ''}`}>{e.courseCode}: {e.courseTitle}</span>
                    {live && <span className="chip bg-ok/15 text-[rgb(var(--ok))]">In progress</span>}
                    {e.status === 'cancelled' && <span className="chip bg-bad/15 text-[rgb(var(--bad))]">Cancelled</span>}
                  </div>
                  <div className="mt-1 text-sm text-muted">{e.teacherName}, {e.kind}</div>
                  <Link href={`/app/halls/${e.hallCode}`} className="mt-1 inline-block text-sm font-semibold text-teal-ink hover:underline"><span className="mono">{e.hallCode}</span>, {e.buildingName}, {floorShort(e.floorLevel)}</Link>
                </div>
                {e.status !== 'cancelled' && <Link href={`/app/navigate?to=${e.hallCode}`} className="btn-soft sm:!min-h-[44px]"><Navigation size={16} />Directions</Link>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
