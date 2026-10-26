'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AirVent, AlertTriangle, ArrowLeft, ArrowLeftRight, Armchair, Building2, Clock, Droplets, Heart, Info, Map as MapIcon, Mic, Navigation, Plug, Projector, QrCode, Share2, Thermometer, Users, Volume2, Wifi, MonitorPlay, PenLine, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { HallArt } from '@/components/art/Scenes';
import { ErrorState, NotFoundArt, Skeleton, StatusPill, Modal } from '@/components/ui';
import { ReportIssueModal, RequestSwapModal } from '@/components/dash/HallActions';
import { api } from '@/lib/api';
import { DAYS, floorShort, TYPE_LABEL, countdown, dur } from '@/lib/format';
import { useAuth, useLocationCtx, useToast } from '@/components/Providers';
import { useFetch } from '@/lib/hooks';

const eqIcon = (n) => (/projector|4k|screen|tv/i.test(n) ? Projector : /air/i.test(n) ? AirVent : /wi-?fi/i.test(n) ? Wifi : /mic|pa |sound/i.test(n) ? Mic : /power|socket/i.test(n) ? Plug : /board/i.test(n) ? PenLine : /water/i.test(n) ? Droplets : /work|pc|computer/i.test(n) ? MonitorPlay : Armchair);

function Detail() {
  const { code } = useParams();
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { loc } = useLocationCtx();
  const { toast } = useToast();
  const { data, error, loading, reload } = useFetch(`/halls/${code}`, { every: 60000 });
  const favs = useFetch('/favorites');
  const mine = useFetch(user?.role === 'teacher' ? '/timetable' : null, { enabled: user?.role === 'teacher' });
  const [walk, setWalk] = useState(null);
  const [week, setWeek] = useState(false);
  const [issue, setIssue] = useState(false);
  const [swap, setSwap] = useState(false);
  const [qr, setQr] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const isFav = !!favs.data?.halls.some((h) => h.code === String(code).toUpperCase());

  useEffect(() => { api(`/recents/${code}`, { method: 'POST' }).catch(() => {}); }, [code]);
  useEffect(() => { if (sp.get('here')) toast(`Location set to ${String(code).toUpperCase()}.`, 'success'); }, []); // eslint-disable-line
  useEffect(() => {
    api(`/route?from=${encodeURIComponent(loc)}&to=${code}${user?.accessibleRoutes ? '&accessible=1' : ''}`).then((r) => setWalk(r.durationSec)).catch(() => setWalk(null));
  }, [code, loc, user?.accessibleRoutes]);
  useEffect(() => {
    if (qr) QRCode.toDataURL(`${window.location.origin}/l/${String(code).toUpperCase()}`, { width: 360, margin: 1, color: { dark: '#0A1A4F', light: '#FFFFFF' } }).then(setQrUrl);
  }, [qr, code]);

  if (error?.status === 404) return <NotFoundArt action={<Link href="/app/halls" className="btn-primary">Browse halls</Link>} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-64 rounded-3xl" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;

  const { hall, schedule, sensors } = data;
  const mins = data.clock.minutes;
  const next = hall.status.next;
  const room = hall.kind === 'room';
  const upcomingEntry = schedule.find((e) => e.startMin > mins && e.status === 'scheduled') || null;
  const live = schedule.find((e) => e.startMin <= mins && mins < e.endMin && e.status === 'scheduled') || null;
  const focus = live || upcomingEntry;
  const enrolled = focus ? Math.min(focus.classSize, hall.capacity) : 0;
  const pct = hall.capacity ? Math.round((enrolled / hall.capacity) * 100) : 0;
  const myEntries = (mine.data?.entries || []).filter((e) => e.hallCode === hall.code);

  const toggleFav = async () => {
    await api(`/favorites/${hall.code}`, { method: isFav ? 'DELETE' : 'PUT' });
    favs.refresh();
    toast(isFav ? 'Removed from saved halls.' : 'Saved to your halls.', 'success');
  };
  const share = async () => {
    const url = `${window.location.origin}/app/halls/${hall.code}`;
    try { if (navigator.share) await navigator.share({ title: hall.name, url }); else { await navigator.clipboard.writeText(url); toast('Link copied.', 'success'); } } catch {}
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="rounded-xl p-2.5 text-muted hover:bg-surface2" aria-label="Back"><ArrowLeft size={20} /></button>
          <span className="mono rounded-lg bg-brand px-3 py-1.5 text-sm font-bold text-on-brand">{hall.code}</span>
          <button onClick={() => setQr(true)} className="chip hidden bg-surface2 text-ink hover:bg-line sm:inline-flex"><QrCode size={14} className="text-teal" />Door QR</button>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleFav} className={`flex h-11 w-11 items-center justify-center rounded-xl border border-line hover:bg-surface2 ${isFav ? 'text-bad' : ''}`} aria-pressed={isFav} aria-label={isFav ? 'Remove from saved halls' : 'Save hall'}><Heart size={20} fill={isFav ? 'currentColor' : 'none'} /></button>
          <button onClick={share} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line hover:bg-surface2" aria-label="Share"><Share2 size={20} /></button>
        </div>
      </div>

      {/* banner */}
      <section className="relative overflow-hidden rounded-3xl">
        <HallArt type={hall.type} className="h-[260px] w-full sm:h-[320px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050C2E]/90 via-[#050C2E]/25 to-transparent" />
        <div className="absolute left-3 top-3 chip bg-white/90 text-[#0A1A4F]"><Building2 size={14} />{floorShort(hall.level)}, {hall.side === 'N' ? 'north' : 'south'} side</div>
        {room && <div className="absolute right-3 top-3 chip bg-[#0A1A4F]/85 text-white"><Volume2 size={14} /><span className="mono">{sensors.noiseDb} dB</span></div>}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="text-sm text-white/80">{TYPE_LABEL[hall.type]}</div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{hall.name}</h1>
        </div>
      </section>

      {/* status card */}
      <section className="card card-pad">
        <div className="flex items-start gap-3"><Building2 size={22} className="mt-0.5 text-brand dark:text-teal" /><div><div className="font-bold">{hall.buildingName}</div><div className="text-sm text-muted">{floorShort(hall.level)}{hall.description ? `. ${hall.description}` : ''}</div></div></div>
        {room && (
          <div className="mt-4 rounded-2xl bg-surface2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold"><Clock size={16} className="text-teal" />{live ? `In use until ${live.end}` : upcomingEntry ? `Next class in ${countdown(upcomingEntry.startMin - mins)}` : 'No more classes today'}</div>
              <StatusPill status={hall.status} />
            </div>
            {hall.capacity > 0 && focus && (
              <div className="mt-4">
                <div className="flex justify-between text-sm"><span className="flex items-center gap-1.5 text-muted"><Armchair size={16} />Seating capacity</span><span className="mono font-semibold">{enrolled} / {hall.capacity}</span></div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} /></div>
                <div className="mono mt-2 flex justify-between text-xs text-muted"><span>Expected: {enrolled} enrolled</span><span>{hall.capacity - enrolled} seats free</span></div>
              </div>
            )}
            {hall.capacity > 0 && !focus && <div className="mt-3 flex items-center gap-1.5 text-sm text-muted"><Armchair size={16} />{hall.capacity} seats</div>}
          </div>
        )}
        {data.issues.length > 0 && <div className="mt-3 flex items-start gap-2 rounded-xl bg-warn/10 px-3 py-2.5 text-sm"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" />Open report: {data.issues.map((i) => i.details || i.kind).join(', ')}</div>}
      </section>

      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr]">
        <Link href={`/app/navigate?to=${hall.code}`} className="btn-teal !min-h-[56px] text-base"><Navigation size={20} />Navigate to this hall{walk != null && <span className="chip bg-black/15 text-inherit">{dur(walk)} walk</span>}</Link>
        <button className="btn-ghost !min-h-[56px]" onClick={() => setQr(true)}><QrCode size={18} />Door QR</button>
        <Link href={`/app/map?hall=${hall.code}`} className="btn-ghost !min-h-[56px]"><MapIcon size={18} />Floor map</Link>
      </div>

      {room && (
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Room conditions</h2><span className="chip bg-surface2 text-muted">Sample readings</span></div>
          <div className="grid grid-cols-3 gap-3">
            {[[Thermometer, `${sensors.temperatureC}°C`, 'Temperature'], [Droplets, `${sensors.co2ppm}`, 'CO2 ppm'], [Wifi, `${sensors.wifiMbps}`, 'Wi-Fi Mbps']].map(([I, v, l]) => (
              <div key={l} className="card p-4 text-center"><I size={22} className="mx-auto text-brand dark:text-teal" /><div className="mono mt-2 text-xl font-bold">{v}</div><div className="text-xs text-muted">{l}</div></div>
            ))}
          </div>
        </section>
      )}

      {hall.equipment.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Amenities and equipment</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {hall.equipment.map((e) => { const I = eqIcon(e); return <div key={e} className="card flex items-center gap-3 p-3.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface2 text-brand dark:text-teal"><I size={20} /></span><span className="text-sm font-semibold leading-tight">{e}</span></div>; })}
          </div>
        </section>
      )}

      {room && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div><h2 className="text-lg font-bold">{week ? 'This week' : 'Today’s schedule'}</h2><p className="text-sm text-muted">{week ? 'Every booking in this hall' : DAYS[data.clock.day]}</p></div>
            <button onClick={() => setWeek(!week)} className="text-sm font-semibold text-teal-ink">{week ? 'Today only' : 'Full week'}</button>
          </div>
          {(week ? data.week : schedule).length === 0 ? (
            <div className="card flex items-center gap-3 p-4 text-sm text-muted"><Info size={18} />Nothing is booked here {week ? 'this week' : 'today'}. It is free to use.</div>
          ) : (
            <ul className="space-y-2.5">
              {(week ? data.week : schedule).map((e) => {
                const isLive = !week && e.startMin <= mins && mins < e.endMin;
                const passed = !week && e.endMin <= mins;
                return (
                  <li key={e.id} className={`flex gap-3 rounded-2xl border p-3.5 ${isLive ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface'} ${passed ? 'opacity-60' : ''}`}>
                    <div className="mono w-[58px] shrink-0 text-[13px] leading-5 opacity-80">{week && <span className="block font-bold">{DAYS[e.day].slice(0, 3)}</span>}{e.start}<br />{e.end}</div>
                    <span className={`w-1 shrink-0 rounded-full ${isLive ? 'bg-[#2DD4BF]' : 'bg-teal'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><span className={`font-semibold ${e.status === 'cancelled' ? 'line-through' : ''}`}>{e.courseCode}: {e.courseTitle}</span>{isLive && <span className="chip bg-[#86F2E4] text-[#00403A]">In use</span>}{passed && <Check size={16} />}{e.status === 'cancelled' && <span className="chip bg-bad/15 text-[rgb(var(--bad))]">Cancelled</span>}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs opacity-80"><span>{e.teacherName}</span><span className="flex items-center gap-1"><Users size={13} />{e.classSize} enrolled</span><span>{e.kind}</span></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <section className="card card-pad bg-surface2/60">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Info size={20} className="text-brand dark:text-teal" />Faculty and desk operations</h2>
        <p className="mt-1 text-sm text-muted">Tell campus facilities about a problem in this hall{user?.role === 'teacher' ? ', or ask for a different hall for one of your classes.' : '.'}</p>
        <div className={`mt-4 grid gap-3 ${user?.role === 'teacher' ? 'grid-cols-2' : ''}`}>
          <button className="btn-ghost" onClick={() => setIssue(true)}><AlertTriangle size={18} className="text-warn" />Report issue</button>
          {user?.role === 'teacher' && <button className="btn-ghost" onClick={() => setSwap(true)} disabled={!mine.data?.entries?.length}><ArrowLeftRight size={18} className="text-brand dark:text-teal" />Request swap</button>}
        </div>
      </section>

      <ReportIssueModal open={issue} onClose={() => setIssue(false)} hallCode={hall.code} onDone={reload} />
      <RequestSwapModal open={swap} onClose={() => setSwap(false)} entries={(mine.data?.entries || [])} />
      <Modal open={qr} onClose={() => setQr(false)} title={`Door QR for ${hall.code}`}>
        <div className="text-center"><div className="mx-auto inline-block rounded-2xl bg-white p-3">{qrUrl ? <img src={qrUrl} alt={`QR code for ${hall.code}`} width={220} height={220} /> : <div className="h-[220px] w-[220px]" />}</div>
          <p className="mt-3 text-sm text-muted">Print this and stick it next to the door. Scanning it sets the visitor’s location to <span className="mono font-semibold">{hall.code}</span>.</p></div>
      </Modal>
    </div>
  );
}
export default function Page() { return <Suspense fallback={<Skeleton className="mx-auto h-64 max-w-3xl rounded-3xl" />}><Detail /></Suspense>; }
