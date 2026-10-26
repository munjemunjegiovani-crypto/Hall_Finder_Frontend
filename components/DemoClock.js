'use client';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Modal } from '@/components/ui';
import { DEMO_MODE, getDemoNow, nextMonday, setDemoClock } from '@/lib/api';

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Douala', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
export const clockLabel = (d) => fmt.format(d).replace(',', '');

const PRESETS = [
  ['Monday 08:15', 'Before the first class', () => nextMonday(8, 15)],
  ['Monday 10:01', 'A class is about to start', () => nextMonday(10, 1)],
  ['Monday 12:15', 'Lunch break, free halls', () => nextMonday(12, 15)],
  ['Wednesday 13:50', 'Afternoon rush', () => nextMonday(13, 50, 2)],
  ['Friday 16:00', 'Late lab session', () => nextMonday(16, 0, 4)],
  ['Saturday 11:00', 'Weekend, no classes', () => nextMonday(11, 0, 5)],
  ['Monday 20:30', 'Campus closed', () => nextMonday(20, 30)],
];

export function useDemoLabel() {
  const [label, setLabel] = useState(null);
  useEffect(() => {
    const tick = () => { const d = getDemoNow(); setLabel(d ? clockLabel(d) : null); };
    tick();
    const t = setInterval(tick, 15000);
    window.addEventListener('hf-demo-changed', tick);
    return () => { clearInterval(t); window.removeEventListener('hf-demo-changed', tick); };
  }, []);
  return label;
}

export function DemoClockChip({ onClick }) {
  const label = useDemoLabel();
  if (!label && !DEMO_MODE) return null;
  return (
    <button onClick={onClick} className="chip border border-line bg-surface2 text-ink hover:bg-line" title="Demo clock">
      <Clock size={14} className="text-teal" /><span className="mono">{label || 'Real time'}</span>
    </button>
  );
}

export function DemoClockModal({ open, onClose }) {
  const label = useDemoLabel();
  return (
    <Modal open={open} onClose={onClose} title="Demo clock">
      <p className="mb-4 text-sm text-muted">Show the app at any moment of the school week. Timetables, reminders and hall availability all follow this clock. The time keeps moving forward from the moment you pick.</p>
      <div className="grid gap-2">
        {PRESETS.map(([t, d, f]) => (
          <button key={t} className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-line px-4 text-left hover:bg-surface2" onClick={() => { setDemoClock(f()); onClose(); }}>
            <span className="font-semibold">{t}</span><span className="text-xs text-muted">{d}</span>
          </button>
        ))}
        <button className={`btn-ghost mt-2 ${!label ? 'border-teal text-teal-ink' : ''}`} onClick={() => { setDemoClock(null); onClose(); }}>Use the real time</button>
      </div>
    </Modal>
  );
}
