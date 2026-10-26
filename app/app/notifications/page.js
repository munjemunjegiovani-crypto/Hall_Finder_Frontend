'use client';
import Link from 'next/link';
import { AlarmClock, Bell, CalendarClock, CheckCheck, Info, Megaphone, TriangleAlert, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/hooks';
import { ago } from '@/lib/format';
import { EmptyState, ErrorState, PageTitle, Skeleton } from '@/components/ui';
import { useToast } from '@/components/Providers';

const ICON = { reminder: AlarmClock, change: CalendarClock, cancelled: XCircle, alert: TriangleAlert, info: Info, request: Megaphone };

export default function Notifications() {
  const { data, error, loading, reload, refresh } = useFetch('/notifications', { every: 30000 });
  const { toast } = useToast();
  const markAll = async () => { await api('/notifications/read', { method: 'POST' }); refresh(); window.dispatchEvent(new Event('hf-notifs')); toast('All caught up.', 'success'); };
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data) return <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>;
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Notifications" sub={data.unread ? `${data.unread} unread` : 'You are all caught up'} right={data.unread > 0 && <button className="btn-ghost !min-h-[42px]" onClick={markAll}><CheckCheck size={16} />Mark all read</button>} />
      {data.reminders.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-muted">Happening soon</h2>
          <ul className="space-y-2.5">{data.reminders.map((r) => (
            <li key={r.id || r.title}><Link href={r.hallCode ? `/app/navigate?to=${r.hallCode}` : '/app/timetable'} className="flex gap-3 rounded-2xl border border-teal bg-teal-soft p-4"><AlarmClock className="mt-0.5 shrink-0 text-teal-ink" size={20} /><div><div className="font-semibold text-teal-ink">{r.title}</div><div className="text-sm text-teal-ink/80">{r.body}</div></div></Link></li>
          ))}</ul>
        </section>
      )}
      {data.items.length === 0 ? <EmptyState icon={Bell} title="Nothing here yet" text="Class reminders, hall changes and campus announcements will show up here." /> : (
        <ul className="space-y-2.5">
          {data.items.map((n) => { const I = ICON[n.type] || Bell; const inner = (
            <div className={`flex gap-3 rounded-2xl border p-4 ${n.read ? 'border-line bg-surface' : 'border-brand/40 bg-surface2'}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand dark:text-teal"><I size={20} /></span>
              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><span className="font-semibold">{n.title}</span>{!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-teal" aria-label="Unread" />}</div>
                {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}<div className="mt-1 text-xs text-muted">{ago(n.createdAt)}</div></div>
            </div>); return <li key={n.id}>{n.hallCode ? <Link href={`/app/halls/${n.hallCode}`}>{inner}</Link> : inner}</li>; })}
        </ul>
      )}
    </div>
  );
}
