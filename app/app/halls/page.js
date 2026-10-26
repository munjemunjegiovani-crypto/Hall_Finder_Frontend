'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DoorOpen, Navigation } from 'lucide-react';
import { useFetch } from '@/lib/hooks';
import { floorShort, TYPE_LABEL } from '@/lib/format';
import { EmptyState, ErrorState, PageTitle, Skeleton, StatusPill } from '@/components/ui';
import SearchBox from '@/components/SearchBox';

const TYPES = [['', 'All'], ['lecture', 'Lecture halls'], ['lab', 'Labs'], ['seminar', 'Seminar rooms'], ['lounge', 'Lounges'], ['library', 'Library'], ['office', 'Offices'], ['restroom', 'Restrooms']];

function Halls() {
  const sp = useSearchParams();
  const router = useRouter();
  const [type, setType] = useState(sp.get('type') || '');
  const [building, setBuilding] = useState('');
  const [free, setFree] = useState(false);
  const qs = new URLSearchParams({ ...(type ? { type } : {}), ...(building ? { building } : {}), ...(free ? { free: '1' } : {}) }).toString();
  const { data, error, loading, reload } = useFetch(`/halls?${qs}`, { every: 60000 });
  const favs = useFetch('/favorites');
  return (
    <div>
      <PageTitle title="Halls and rooms" sub="Every lecture hall, lab and study space with live availability." />
      <SearchBox onPickHall={(c) => router.push(`/app/halls/${c}`)} placeholder="Search by hall code, name or teacher" className="mb-4" />
      <div className="scroll-hide -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TYPES.map(([v, l]) => <button key={v} onClick={() => setType(v)} className={`chip shrink-0 !px-3.5 !py-2 text-sm ${type === v ? 'bg-brand text-on-brand' : 'border border-line bg-surface'}`}>{l}</button>)}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {['', 'A', 'B', 'C'].map((b) => <button key={b} onClick={() => setBuilding(b)} className={`chip !px-3 !py-1.5 text-sm ${building === b ? 'bg-teal-soft text-teal-ink ring-1 ring-teal' : 'bg-surface2'}`}>{b ? `Building ${b}` : 'All buildings'}</button>)}
        <button onClick={() => setFree(!free)} className={`chip ml-auto !px-3 !py-1.5 text-sm ${free ? 'bg-ok/15 text-[rgb(var(--ok))] ring-1 ring-ok' : 'bg-surface2'}`} aria-pressed={free}>Free right now</button>
      </div>
      {favs.data?.halls.length > 0 && !type && !building && !free && (
        <div className="mb-5 flex flex-wrap gap-2">{favs.data.halls.map((h) => <Link key={h.code} href={`/app/halls/${h.code}`} className="chip border border-line bg-surface px-3 py-2 text-sm"><span className="mono font-semibold">{h.code}</span>{h.name}</Link>)}</div>
      )}
      {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
        : !data.halls.length ? <EmptyState title="No halls match" text="Try removing a filter." icon={DoorOpen} />
          : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.halls.map((h) => (
                <div key={h.code} className="card card-pad flex flex-col">
                  <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="mono text-lg font-bold">{h.code}</div><Link href={`/app/halls/${h.code}`} className="line-clamp-1 text-sm font-semibold hover:underline">{h.name}</Link></div><StatusPill status={h.status} /></div>
                  <div className="mt-1.5 text-xs text-muted">{TYPE_LABEL[h.type]}, {h.buildingName}, {floorShort(h.level)}{h.capacity ? `, ${h.capacity} seats` : ''}</div>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-4"><Link href={`/app/halls/${h.code}`} className="btn-ghost !min-h-[42px] text-[13px]">Details</Link><Link href={`/app/navigate?to=${h.code}`} className="btn-soft !min-h-[42px] text-[13px]"><Navigation size={15} />Directions</Link></div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
export default function Page() { return <Suspense fallback={<Skeleton className="h-64" />}><Halls /></Suspense>; }
