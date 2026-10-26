'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Footprints, GraduationCap, Info, Navigation } from 'lucide-react';
import { api } from '@/lib/api';
import { countdown, DAYS, floorShort, dur } from '@/lib/format';
import { useAuth, useLocationCtx } from '@/components/Providers';

export default function NextClassCard({ current, next, minutesUntil, daysAhead, role }) {
  const { user } = useAuth();
  const { loc } = useLocationCtx();
  const e = current || next;
  const [walk, setWalk] = useState(null);
  useEffect(() => {
    if (!e) return;
    api(`/route?from=${encodeURIComponent(loc)}&to=${e.hallCode}${user?.accessibleRoutes ? '&accessible=1' : ''}`).then((r) => setWalk(r.durationSec)).catch(() => setWalk(null));
  }, [e?.hallCode, loc, user?.accessibleRoutes]); // eslint-disable-line
  if (!e) return null;
  const live = !!current;
  const chip = live ? `In progress, ends ${e.end}` : daysAhead === 0 ? `Starts in ${countdown(minutesUntil)}` : `${DAYS[e.day]} at ${e.start}`;
  const soon = !live && daysAhead === 0 && minutesUntil <= 20;
  return (
    <section className="relative isolate overflow-hidden rounded-3xl p-5 text-white shadow-float sm:p-7" style={{ background: 'linear-gradient(135deg, #0A1A4F 0%, #17318A 60%, #1E3FA3 100%)' }} aria-label="Next class">
      <div className="absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-teal/25 blur-3xl" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`chip ${soon ? 'bg-[#86F2E4] text-[#00403A]' : live ? 'bg-[#86F2E4] text-[#00403A]' : 'bg-white/15 text-white'}`}>
          <span className={`h-2 w-2 rounded-full ${soon || live ? 'bg-[#0D9488] animate-pulse' : 'bg-white/70'}`} />{chip}
        </span>
        <span className="mono rounded-full bg-white/10 px-3 py-1 text-xs">{e.start} to {e.end}</span>
      </div>
      <h2 className="mt-4 text-2xl font-extrabold leading-tight text-white sm:text-[30px]">{e.courseCode}: {e.courseTitle}</h2>
      {role !== 'teacher' && e.teacherName && <p className="mt-1.5 flex items-center gap-2 text-[15px] text-white/75"><GraduationCap size={18} />{e.teacherName}</p>}
      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
        <div className="min-w-0">
          <div className="mono text-xl font-bold">{e.hallCode}</div>
          <div className="truncate text-sm text-white/75">{e.hallName}, {e.buildingName}, {floorShort(e.floorLevel)}</div>
        </div>
        {walk != null && <span className="chip shrink-0 bg-white/15 text-white"><Footprints size={14} />{dur(walk)} walk</span>}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        <Link href={`/app/navigate?to=${e.hallCode}`} className="btn !min-h-[52px] bg-teal text-base text-white hover:brightness-110 dark:text-[#04201d]"><Navigation size={18} />Navigate to {e.hallCode}</Link>
        <Link href={`/app/halls/${e.hallCode}`} className="btn !min-h-[52px] bg-white/12 text-white hover:bg-white/20"><Info size={18} />Hall info</Link>
      </div>
    </section>
  );
}
