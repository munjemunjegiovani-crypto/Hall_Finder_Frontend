'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, BookOpen, Building2, Coffee, Info, Users } from 'lucide-react';
import { useFetch } from '@/lib/hooks';
import { greeting, floorShort } from '@/lib/format';
import { useAuth } from '@/components/Providers';
import { EmptyState, ErrorState, Skeleton, StatusPill } from '@/components/ui';
import SearchBox from '@/components/SearchBox';
import NextClassCard from './NextClassCard';
import ScheduleList from './ScheduleList';
import { t } from '@/lib/i18n';

const QUICK = [['A001', 'Central Library', BookOpen], ['A002', 'Main Cafeteria', Coffee], ['A003', 'Admissions office', Building2]];

export default function StudentDash() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, error, loading, reload } = useFetch('/dashboard', { every: 60000 });
  const free = useFetch('/halls?free=1', { every: 60000 });
  const favs = useFetch('/favorites');
  const lang = user.language;

  if (error) return <ErrorState error={error} onRetry={reload} />;
  const hi = data ? `${greeting(data.clock.minutes)}, ${user.name.split(' ')[0]}` : ' ';
  const banner = data?.announcements.find((a) => a.level !== 'info') || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{hi}</h1>
          <p className="mt-1 text-sm text-muted">{user.department}, Level {user.level}</p>
        </div>
        <span className="chip border border-line bg-surface text-ink"><span className="mono">ID {user.schoolId}</span></span>
      </div>

      {banner && (
        <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${banner.level === 'urgent' ? 'border-bad/40 bg-bad/10' : 'border-warn/40 bg-warn/10'}`} role="status">
          <AlertTriangle size={18} className={`mt-0.5 shrink-0 ${banner.level === 'urgent' ? 'text-bad' : 'text-warn'}`} />
          <div><span className="font-semibold">{banner.title}.</span> <span className="text-muted">{banner.body}</span></div>
        </div>
      )}

      {loading ? <Skeleton className="h-64 rounded-3xl" /> : data.next || data.current ? <NextClassCard {...data} role="student" /> : <EmptyState title="No classes on your timetable" text="Ask the school office to add your courses." />}

      <SearchBox placeholder={t(lang, 'search')} onPickHall={(c) => router.push(`/app/halls/${c}`)} />

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">{t(lang, 'quickLinks')}</h2><Link href="/app/halls" className="text-sm font-semibold text-teal-ink">All halls</Link></div>
        <div className="scroll-hide -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {QUICK.map(([code, label, Icon]) => (
            <Link key={code} href={`/app/navigate?to=${code}`} className="flex min-h-[52px] shrink-0 items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 text-sm font-semibold hover:bg-surface2"><Icon size={20} className="text-brand dark:text-teal" />{label}</Link>
          ))}
          <Link href="/app/halls?type=restroom" className="flex min-h-[52px] shrink-0 items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 text-sm font-semibold hover:bg-surface2"><Users size={20} className="text-brand dark:text-teal" />Restrooms</Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{t(lang, 'todaySchedule')} {data && <span className="mono ml-1.5 rounded-md bg-surface2 px-2 py-0.5 text-xs font-medium text-muted">{data.today.length}</span>}</h2>
            <Link href="/app/timetable" className="text-sm font-semibold text-teal-ink">{t(lang, 'fullTimetable')}</Link>
          </div>
          {loading ? <div className="space-y-2.5"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
            : data.today.length ? <ScheduleList items={data.today} nextId={data.next?.id} />
              : <EmptyState title="No classes today" text="Enjoy the free day. Use the map to find a quiet study space." icon={Info} />}
        </section>

        <section>
          <h2 className="mb-1 text-lg font-bold">{t(lang, 'studyHalls')}</h2>
          <p className="mb-3 text-sm text-muted">Empty right now, so you can revise before the next lecture.</p>
          {free.loading ? <div className="grid gap-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
            : free.data?.halls.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {free.data.halls.slice(0, 4).map((h) => (
                  <div key={h.code} className="card card-pad">
                    <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="mono text-lg font-bold">{h.code}</div><div className="truncate text-sm text-muted">{h.name}</div></div><StatusPill status={h.status} /></div>
                    <div className="mt-1 text-xs text-muted">{h.buildingName}, {floorShort(h.level)}, {h.capacity} seats</div>
                    <Link href={`/app/navigate?to=${h.code}`} className="btn-soft mt-3 w-full">Directions</Link>
                  </div>
                ))}
              </div>
            ) : <EmptyState title="No free halls right now" text="Try again after the next class change." />}
        </section>
      </div>

      {favs.data?.halls.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Saved halls</h2>
          <div className="flex flex-wrap gap-2">{favs.data.halls.map((h) => <Link key={h.code} href={`/app/halls/${h.code}`} className="chip border border-line bg-surface px-3 py-2 text-sm hover:bg-surface2"><span className="mono font-semibold">{h.code}</span>{h.name}</Link>)}</div>
        </section>
      )}
    </div>
  );
}
