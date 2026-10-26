'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, DoorOpen, LayoutDashboard, LogOut, Map as MapIcon, MapPin, QrCode, Shield, UserRound } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import Onboarding from '@/components/Onboarding';
import { DemoClockChip, DemoClockModal } from '@/components/DemoClock';
import { LocationPicker, QrScanner, useLocationName } from '@/components/LocationTools';
import { Spinner } from '@/components/ui';
import { useAuth, useLocationCtx, useToast } from '@/components/Providers';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';

function navFor(role) {
  if (role === 'admin') return [['/app', 'admin', LayoutDashboard], ['/app/map', 'map', MapIcon], ['/app/halls', 'halls', DoorOpen], ['/app/timetable', 'timetable', CalendarDays], ['/app/profile', 'profile', UserRound]];
  return [['/app', 'home', LayoutDashboard], ['/app/map', 'map', MapIcon], ['/app/timetable', 'timetable', CalendarDays], ['/app/halls', 'halls', DoorOpen], ['/app/profile', 'profile', UserRound]];
}

export default function AppShell({ children }) {
  const { user, ready, logout, updateMe } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const { toast } = useToast();
  const { loc } = useLocationCtx();
  const locName = useLocationName(loc);
  const [pickLoc, setPickLoc] = useState(false);
  const [scan, setScan] = useState(false);
  const [clock, setClock] = useState(false);
  const [unread, setUnread] = useState(0);
  const seen = useRef(new Set());

  useEffect(() => { if (ready && !user) router.replace(`/login?next=${encodeURIComponent(path)}`); }, [ready, user, path, router]);

  const poll = useCallback(async () => {
    if (!user) return;
    try {
      const d = await api('/notifications');
      setUnread(d.unread);
      for (const r of d.reminders) {
        if (r.type !== 'reminder' || seen.current.has(r.id)) continue;
        seen.current.add(r.id);
        toast(`${r.title}. ${r.body}`, 'info', { label: 'Navigate', href: `/app/navigate?to=${r.hallCode}` });
        if (user.notifyPush && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification(r.title, { body: r.body }); } catch {}
        }
      }
    } catch {}
  }, [user, toast]);
  useEffect(() => {
    poll();
    const id = setInterval(poll, 30000);
    window.addEventListener('hf-demo-changed', poll);
    return () => { clearInterval(id); window.removeEventListener('hf-demo-changed', poll); };
  }, [poll, path]);

  if (!ready || !user) return <div className="flex min-h-screen items-center justify-center"><Spinner label="Opening HallFinder" /></div>;

  const lang = user.language;
  const items = navFor(user.role);
  const bleed = path === '/app/map' || path === '/app/navigate';
  const active = (href) => (href === '/app' ? path === '/app' : path.startsWith(href));

  return (
    <div className="min-h-screen">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
        <Logo href="/app" />
        <nav className="mt-8 flex-1 space-y-1" aria-label="App">
          {items.map(([href, key, Icon]) => (
            <Link key={href} href={href} className={`flex min-h-[46px] items-center gap-3 rounded-xl px-3.5 text-[15px] font-semibold transition ${active(href) ? 'bg-brand text-on-brand' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>
              <Icon size={20} />{t(lang, key)}
            </Link>
          ))}
        </nav>
        <div className="rounded-2xl bg-surface2 p-3.5">
          <div className="truncate text-sm font-bold">{user.name}</div>
          <div className="truncate text-xs capitalize text-muted">{user.role}{user.department ? `, ${user.department}` : ''}</div>
          <button onClick={() => { logout(); router.push('/'); }} className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><LogOut size={16} />{t(lang, 'signOut')}</button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
          <div className="flex h-16 items-center gap-2 px-3 sm:px-6">
            <div className="lg:hidden"><Logo href="/app" sub={false} /></div>
            <button onClick={() => setPickLoc(true)} className="hidden min-h-[40px] max-w-[300px] items-center gap-2 rounded-xl bg-teal-soft px-3 text-sm font-semibold text-teal-ink hover:brightness-95 sm:flex" aria-label="Change my location">
              <MapPin size={16} /><span className="truncate">You are at {locName}</span>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden sm:block"><DemoClockChip onClick={() => setClock(true)} /></div>
              <button onClick={() => setPickLoc(true)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-teal sm:hidden" aria-label="Change my location"><MapPin size={20} /></button>
              <button onClick={() => setScan(true)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line hover:bg-surface2" aria-label="Scan a door QR code"><QrCode size={20} /></button>
              <Link href="/app/notifications" className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-line hover:bg-surface2" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
                <Bell size={20} />{unread > 0 && <span className="mono absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold text-white">{unread}</span>}
              </Link>
              <div className="hidden sm:block"><ThemeToggle /></div>
              <Link href="/app/profile" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-sm font-bold text-on-brand" aria-label="Profile">{user.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}</Link>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 pb-2 sm:hidden"><DemoClockChip onClick={() => setClock(true)} /><span className="truncate text-xs text-muted">You are at {locName}</span></div>
        </header>

        <main className={bleed ? '' : 'page py-5 pb-28 lg:pb-12'}>{children}</main>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden safe-bottom" aria-label="App">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {items.map(([href, key, Icon]) => (
            <li key={href}>
              <Link href={href} className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active(href) ? 'text-brand dark:text-teal' : 'text-muted'}`} aria-current={active(href) ? 'page' : undefined}>
                <Icon size={22} strokeWidth={active(href) ? 2.5 : 2} />{t(lang, key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <LocationPicker open={pickLoc} onClose={() => setPickLoc(false)} onScan={() => setScan(true)} />
      <QrScanner open={scan} onClose={() => setScan(false)} />
      <DemoClockModal open={clock} onClose={() => setClock(false)} />
      <Onboarding open={!user.onboarded} onDone={() => updateMe({ onboarded: true })} />
    </div>
  );
}
