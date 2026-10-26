'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, LogOut, Moon, Send, Sun, Monitor } from 'lucide-react';
import { api, store, DEMO_MODE } from '@/lib/api';
import { useFetch } from '@/lib/hooks';
import { PageTitle, Segmented, Toggle } from '@/components/ui';
import { DemoClockChip, DemoClockModal } from '@/components/DemoClock';
import { useAuth, useTheme, useToast } from '@/components/Providers';

export default function Profile() {
  const { user, updateMe, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const favs = useFetch('/favorites');
  const [clock, setClock] = useState(false);
  const [large, setLarge] = useState(false);
  const [msg, setMsg] = useState('');
  const [rating, setRating] = useState(5);
  const [name, setName] = useState(user?.name || '');
  useEffect(() => { setLarge(store.get('hf_large') === '1'); }, []);
  if (!user) return null;
  const save = async (patch, ok = 'Saved.') => { try { await updateMe(patch); toast(ok, 'success'); } catch (e) { toast(e.message, 'error'); } };
  const pickTheme = (t) => { setTheme(t); updateMe({ theme: t }).catch(() => {}); };
  const toggleLarge = (v) => { setLarge(v); store.set('hf_large', v ? '1' : '0'); document.documentElement.classList.toggle('large-text', v); };
  const send = async () => { try { await api('/feedback', { method: 'POST', body: { message: msg, rating } }); setMsg(''); toast('Thank you for your feedback.', 'success'); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageTitle title="Profile and settings" />
      <section className="card card-pad">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-extrabold text-on-brand">{user.name.slice(0, 1)}</span>
          <div className="min-w-0"><div className="truncate text-lg font-bold">{user.name}</div><div className="truncate text-sm text-muted">{user.email}</div>
            <div className="mt-1 flex flex-wrap gap-2"><span className="chip bg-surface2 capitalize">{user.role}</span>{user.department && <span className="chip bg-surface2">{user.department}{user.role === 'student' ? `, Level ${user.level}` : ''}</span>}{user.schoolId && <span className="chip mono bg-surface2">{user.schoolId}</span>}</div></div>
        </div>
        <div className="mt-4 flex gap-2"><div className="flex-1"><label className="label" htmlFor="pn">Display name</label><input id="pn" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <button className="btn-primary self-end" disabled={!name.trim() || name === user.name} onClick={() => save({ name })}>Save</button></div>
      </section>

      <section className="card card-pad divide-y divide-line">
        <h2 className="pb-2 text-lg font-bold">Reminders</h2>
        <div className="py-3"><span className="label">Remind me before class</span>
          <Segmented value={String(user.reminderMinutes)} onChange={(v) => save({ reminderMinutes: Number(v) })} options={[['5', '5 min'], ['10', '10 min'], ['15', '15 min'], ['30', '30 min']]} /></div>
        <Toggle checked={!!user.notifyPush} onChange={async (v) => { if (v && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission(); save({ notifyPush: v }); }} label="Browser notifications" hint="A pop-up while HallFinder is open." />
        <Toggle checked={!!user.notifyEmail} onChange={(v) => save({ notifyEmail: v })} label="Email reminders" hint="Demo only: emails are not sent from the sample server." />
      </section>

      <section className="card card-pad divide-y divide-line">
        <h2 className="pb-2 text-lg font-bold">Appearance and access</h2>
        <div className="py-3"><span className="label">Theme</span>
          <Segmented value={theme} onChange={pickTheme} options={[['light', 'Light'], ['dark', 'Dark'], ['system', 'Auto']]} /></div>
        <div className="py-3"><span className="label">Language</span>
          <Segmented value={user.language} onChange={(v) => save({ language: v })} options={[['en', 'English'], ['fr', 'Français']]} /></div>
        <Toggle checked={!!user.accessibleRoutes} onChange={(v) => save({ accessibleRoutes: v })} label="Step-free routes" hint="Use lifts and ramps. Avoid stairs." />
        <Toggle checked={large} onChange={toggleLarge} label="Larger text" />
      </section>

      <section className="card card-pad">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Heart size={18} className="text-bad" />Saved halls</h2>
        {favs.data?.halls.length ? <div className="mt-3 flex flex-wrap gap-2">{favs.data.halls.map((h) => <Link key={h.code} href={`/app/halls/${h.code}`} className="chip border border-line bg-surface px-3 py-2 text-sm"><span className="mono font-semibold">{h.code}</span>{h.name}</Link>)}</div>
          : <p className="mt-2 text-sm text-muted">Tap the heart on any hall to save it here.</p>}
      </section>

      {DEMO_MODE && (
        <section className="card card-pad">
          <h2 className="text-lg font-bold">Demo clock</h2>
          <p className="mt-1 text-sm text-muted">The sample school runs on a simulated Monday so every feature has something to show. Change the time to see reminders and hall status update.</p>
          <div className="mt-3"><DemoClockChip onClick={() => setClock(true)} /></div>
          <DemoClockModal open={clock} onClose={() => setClock(false)} />
        </section>
      )}

      <section className="card card-pad">
        <h2 className="text-lg font-bold">Send feedback</h2>
        <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map((n) => <button key={n} role="radio" aria-checked={rating === n} onClick={() => setRating(n)} className={`h-10 w-10 rounded-xl text-lg ${n <= rating ? 'bg-warn/20' : 'bg-surface2 opacity-50'}`}>★</button>)}</div>
        <textarea className="input mt-3 !py-3" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="What works well? What should we fix?" aria-label="Feedback" />
        <button className="btn-primary mt-3" disabled={msg.trim().length < 3} onClick={send}><Send size={16} />Send</button>
      </section>

      <button className="btn-ghost w-full text-bad" onClick={() => { logout(); router.replace('/login'); }}><LogOut size={18} />Sign out</button>
    </div>
  );
}
