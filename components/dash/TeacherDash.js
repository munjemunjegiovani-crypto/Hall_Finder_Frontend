'use client';
import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, ArrowLeftRight, CalendarCheck, DoorOpen, Users } from 'lucide-react';
import { useFetch } from '@/lib/hooks';
import { greeting } from '@/lib/format';
import { useAuth } from '@/components/Providers';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import NextClassCard from './NextClassCard';
import ScheduleList from './ScheduleList';
import { ReportIssueModal, RequestSwapModal } from './HallActions';

export default function TeacherDash() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useFetch('/dashboard', { every: 60000 });
  const tt = useFetch('/timetable');
  const att = useFetch('/teacher/attendance');
  const reqs = useFetch('/change-requests/mine');
  const [issue, setIssue] = useState(false);
  const [swap, setSwap] = useState(false);
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{data ? `${greeting(data.clock.minutes)}, ${user.name.replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/, '').split(' ')[0]}` : ' '}</h1>
        <p className="mt-1 text-sm text-muted">{user.department}, staff ID <span className="mono">{user.schoolId}</span></p>
      </div>

      {loading ? <Skeleton className="h-64 rounded-3xl" /> : data.next || data.current ? <NextClassCard {...data} role="teacher" /> : <EmptyState title="No lectures assigned" text="The school office has not assigned you any classes yet." />}

      <div className="grid grid-cols-3 gap-3">
        {[[CalendarCheck, data?.stats.classesToday, 'lectures today'], [Users, data?.stats.weeklyClasses, 'sessions this week'], [DoorOpen, data?.stats.halls, 'halls you teach in']].map(([Icon, n, l]) => (
          <div key={l} className="card p-4"><Icon size={20} className="text-brand dark:text-teal" /><div className="mt-2 font-display text-2xl font-bold">{n ?? '–'}</div><div className="text-xs text-muted">{l}</div></div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Today’s lectures</h2><Link href="/app/timetable" className="text-sm font-semibold text-teal-ink">Weekly schedule</Link></div>
          {loading ? <Skeleton className="h-24" /> : data.today.length ? <ScheduleList items={data.today} nextId={data.next?.id} teacher /> : <EmptyState title="No lectures today" text="Your schedule is clear. Check the weekly view for what comes next." />}
        </section>
        <div className="space-y-6">
          <section className="card card-pad">
            <h2 className="text-lg font-bold">Hall operations</h2>
            <p className="mt-1 text-sm text-muted">Dispatch facilities help or ask for a different hall.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="btn-ghost" onClick={() => setIssue(true)}><AlertTriangle size={18} className="text-warn" />Report issue</button>
              <button className="btn-ghost" onClick={() => setSwap(true)}><ArrowLeftRight size={18} className="text-brand dark:text-teal" />Request swap</button>
            </div>
            {reqs.data?.requests.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                {reqs.data.requests.slice(0, 3).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2"><span>{r.courseCode} to <span className="mono">{r.hallCode}</span></span>
                    <span className={`chip ${r.status === 'approved' ? 'bg-ok/15 text-[rgb(var(--ok))]' : r.status === 'declined' ? 'bg-bad/15 text-[rgb(var(--bad))]' : 'bg-warn/15 text-[rgb(var(--warn))]'}`}>{r.status}</span></li>
                ))}
              </ul>
            )}
          </section>
          <section className="card card-pad">
            <h2 className="text-lg font-bold">Attendance snapshot</h2>
            <p className="mb-3 text-xs text-muted">Sample figures for the demo. Connect your attendance system to show real numbers.</p>
            <div className="space-y-3">
              {att.data?.courses.map((c) => (
                <div key={c.id}>
                  <div className="flex justify-between text-sm"><span className="font-medium">{c.code}</span><span className="mono text-muted">{c.presentLast}/{c.classSize}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface2"><div className="h-full rounded-full bg-teal" style={{ width: `${c.rate}%` }} /></div>
                </div>
              )) || <Skeleton className="h-16" />}
            </div>
          </section>
        </div>
      </div>

      <ReportIssueModal open={issue} onClose={() => setIssue(false)} />
      <RequestSwapModal open={swap} onClose={() => setSwap(false)} entries={tt.data?.entries || []} onDone={reqs.refresh} />
    </div>
  );
}
