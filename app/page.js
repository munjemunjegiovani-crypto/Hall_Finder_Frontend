'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BellRing, Compass, Footprints, Accessibility, QrCode, DoorOpen, Users, GraduationCap, ShieldCheck, Check, Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import DemoButton from '@/components/DemoButton';
import HeroScene from '@/components/art/HeroScene';
import Petals from '@/components/art/Petals';
import MiniMap from '@/components/art/MiniMap';
import { ClassroomScene, LibraryScene, LabScene, PlazaScene } from '@/components/art/Scenes';
import { api, SCHOOL_NAME } from '@/lib/api';
import { useAuth } from '@/components/Providers';

const NAV = [['Features', '#features'], ['How it works', '#how'], ['Campus', '#campus'], ['Who it is for', '#roles']];

function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="page flex h-[72px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV.map(([l, h]) => <a key={h} href={h} className="text-sm font-medium text-ink/80 hover:text-ink">{l}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link href="/app" className="btn-primary hidden sm:inline-flex">Open app</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
              <Link href="/register" className="btn-primary hidden sm:inline-flex">Create account</Link>
            </>
          )}
          <button className="btn-ghost !px-3 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && (
        <div className="page animate-pop md:hidden">
          <div className="card space-y-1 p-3 shadow-float">
            {NAV.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-surface2">{l}</a>)}
            <div className="grid grid-cols-2 gap-2 pt-2"><Link href="/login" className="btn-ghost">Sign in</Link><Link href="/register" className="btn-primary">Create account</Link></div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden grain bg-[var(--sky-top)] md:min-h-[820px]">
      <div className="page relative z-10 pb-6 pt-[104px] md:min-h-[820px] md:pt-[150px] md:pb-0">
        <div className="max-w-[560px]">
          <h1 className="font-display text-[40px] font-extrabold leading-[1.04] text-ink sm:text-[56px] md:text-[64px]">
            Find your hall before the bell rings.
          </h1>
          <p className="mt-5 max-w-[470px] text-[17px] leading-relaxed text-ink/80">
            HallFinder works like GPS inside your school. Live floor maps, step-by-step directions and timetable reminders for students and teachers.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <DemoButton role="student" className="btn-primary !min-h-[52px] !px-6 text-base shadow-float">
              Try the student demo <ArrowRight size={18} />
            </DemoButton>
            <DemoButton role="teacher" className="btn-ghost !min-h-[52px] !px-6 text-base bg-surface/80 backdrop-blur">
              Teacher demo
            </DemoButton>
          </div>
          <p className="mt-4 hidden text-sm text-ink/70 md:block">No sign-up needed. The demo opens on a simulated Monday morning.</p>
        </div>
      </div>
      <HeroScene className="relative -mt-2 h-[400px] w-full md:absolute md:inset-0 md:mt-0 md:h-full" />
      <Petals />
    </section>
  );
}

function Stats() {
  const [n, setN] = useState(60);
  useEffect(() => { api('/campus').then((d) => setN(d.hallCount)).catch(() => {}); }, []);
  const items = [[n, 'halls, labs and offices'], [3, 'buildings'], [10, 'floors with live maps'], ['QR', 'on every door']];
  return (
    <div className="page relative z-10 -mt-12">
      <div className="card grid grid-cols-2 gap-px overflow-hidden bg-line shadow-float md:grid-cols-4">
        {items.map(([a, b]) => (
          <div key={b} className="bg-surface px-5 py-5">
            <div className="font-display text-3xl font-bold text-brand dark:text-teal">{a}</div>
            <div className="mt-0.5 text-sm text-muted">{b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text, children, className = '' }) {
  return (
    <div className={`card card-pad flex flex-col ${className}`}>
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-soft text-teal-ink"><Icon size={22} /></span>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1.5 max-w-prose text-[15px] leading-relaxed text-muted">{text}</p>
      {children}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="page scroll-mt-20 py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Built for people who are already late for class</h2>
        <p className="mt-3 text-lg text-muted">Everything a student, teacher or school office needs to move around a big campus without asking for directions.</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-6">
        <Feature icon={Compass} title="Indoor maps that feel like GPS" text="Switch buildings and floors, see which halls are free right now, and watch your route light up on the plan." className="md:col-span-4">
          <MiniMap className="mt-5 w-full rounded-xl border border-line" />
        </Feature>
        <Feature icon={BellRing} title="Reminders that know your timetable" text="Get a nudge 5 to 30 minutes before class with the hall and the way there. Hall swaps and cancellations arrive instantly." className="md:col-span-2">
          <div className="mt-5 rounded-xl border border-line bg-surface2 p-3.5 text-sm">
            <div className="font-semibold">CS302 starts in 12 min</div>
            <div className="mt-0.5 text-muted">Database Management Systems in Albert Einstein Memorial Hall (B204)</div>
            <div className="mt-3 inline-flex rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-on-brand">Navigate</div>
          </div>
        </Feature>
        <Feature icon={Footprints} title="Turn-by-turn, to the door" text="Plain instructions such as “Turn left, walk 40 m. Hall B204 is the 3rd door on your right.”" className="md:col-span-2">
          <ol className="mt-5 space-y-2 text-sm">
            {['Take the elevator to Floor 2', 'Step out and turn right', 'B204 is the 1st door on your right'].map((s, i) => (
              <li key={s} className="flex items-center gap-2.5"><span className="mono flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] text-on-brand">{i + 1}</span>{s}</li>
            ))}
          </ol>
        </Feature>
        <Feature icon={QrCode} title="Scan a door to know where you are" text="Every hall has a QR code. Scan it and HallFinder knows your exact position, no beacons or special hardware." className="md:col-span-2" />
        <Feature icon={DoorOpen} title="Find an empty hall to study" text="Live free, busy-soon and in-use status for every room, based on the timetable." className="md:col-span-2" />
        <Feature icon={Accessibility} title="Step-free routes" text="Turn on step-free routing and the planner uses elevators and ramps only." className="md:col-span-3" />
        <Feature icon={ShieldCheck} title="Admin tools with conflict checks" text="Add timetables, swap halls and publish announcements. Double-booked halls and teachers are caught before they reach anyone." className="md:col-span-3" />
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ['Search or scan', 'Type a hall, course or teacher, or scan the QR code on the nearest door to tell HallFinder where you are.'],
    ['Follow the route', 'See the path on the floor plan with plain-language steps. Stairs, lifts, corridors and doors are all covered.'],
    ['Arrive on time', 'Tap “I have arrived”. Your timetable and reminders keep working in the background.'],
  ];
  return (
    <section id="how" className="scroll-mt-20 bg-surface2/60 py-24">
      <div className="page">
        <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">From lost to seated in three steps</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="card card-pad">
              <span className="mono flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-on-brand">{i + 1}</span>
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Campus() {
  const tiles = [
    [ClassroomScene, 'Lecture halls', 'Tiered halls and seminar rooms with live availability.'],
    [LibraryScene, 'Library and quiet floors', 'Find a silent desk and see when the library closes.'],
    [LabScene, 'Labs and workshops', 'Computer, electronics and science labs, door by door.'],
    [PlazaScene, 'The campus plaza', 'Directions work between buildings too, from the main gate to the last door.'],
  ];
  return (
    <section id="campus" className="page scroll-mt-20 py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-extrabold sm:text-4xl">A big campus that feels small</h2>
        <p className="mt-3 text-lg text-muted">{SCHOOL_NAME} has three buildings, ten floors and over sixty rooms. HallFinder covers every one.</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {tiles.map(([Art, t, d]) => (
          <figure key={t} className="card overflow-hidden">
            <Art className="aspect-[4/3] w-full" />
            <figcaption className="p-5">
              <div className="text-lg font-bold">{t}</div>
              <div className="mt-1 text-[15px] text-muted">{d}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Roles() {
  const cols = [
    { role: 'student', icon: GraduationCap, title: 'Students', pts: ['Next class card with a countdown', 'Directions from wherever you stand', 'Free halls for revision', 'Favourite and recent halls'] },
    { role: 'teacher', icon: Users, title: 'Teachers', pts: ['Today’s lectures and halls at a glance', 'One tap to navigate to your hall', 'Report a broken projector or locked door', 'Request a hall swap'] },
    { role: 'admin', icon: ShieldCheck, title: 'School office', pts: ['Manage halls, timetables and users', 'Double-booking detection', 'Announcements to everyone', 'Printable QR door codes'] },
  ];
  return (
    <section id="roles" className="scroll-mt-20 bg-surface2/60 py-24">
      <div className="page">
        <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">One app, three ways to use it</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cols.map(({ role, icon: Icon, title, pts }) => (
            <div key={role} className="card card-pad flex flex-col">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-on-brand"><Icon size={22} /></span>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <ul className="mt-3 flex-1 space-y-2.5">
                {pts.map((p) => <li key={p} className="flex gap-2.5 text-[15px]"><Check size={18} className="mt-0.5 shrink-0 text-teal" />{p}</li>)}
              </ul>
              <DemoButton role={role} className="btn-ghost mt-6">Try as {title === 'School office' ? 'admin' : title.toLowerCase().slice(0, -1)}</DemoButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="page py-24">
      <div className="relative isolate overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center text-white sm:px-12">
        <div className="absolute inset-0 -z-10 opacity-90" style={{ background: 'radial-gradient(900px 340px at 80% 0%, rgba(45,212,191,.28), transparent 60%), radial-gradient(700px 300px at 0% 100%, rgba(96,130,255,.35), transparent 60%)' }} />
        <Petals />
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">Ready to find your hall?</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/75">Open the demo and look around. Everything works, from the map to the admin console.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <DemoButton role="student" className="btn !min-h-[52px] bg-white px-6 text-base text-[#0A1A4F] hover:bg-white/90">Try the student demo</DemoButton>
          <Link href="/register" className="btn !min-h-[52px] border border-white/30 px-6 text-base text-white hover:bg-white/10">Create an account</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="page flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">Indoor wayfinding and timetable reminders for {SCHOOL_NAME}. Demo build: map positions are set by QR code or by choosing your starting point.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-label="Footer">
          <Link href="/login" className="hover:text-ink">Sign in</Link>
          <Link href="/register" className="hover:text-ink">Create account</Link>
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#roles" className="hover:text-ink">Who it is for</a>
        </nav>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <How />
        <Campus />
        <Roles />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
