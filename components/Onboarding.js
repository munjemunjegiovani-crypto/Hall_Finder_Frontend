'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui';
import { PlazaScene, ClassroomScene } from '@/components/art/Scenes';
import MiniMap from '@/components/art/MiniMap';

const SLIDES = [
  { title: 'Know where you are', text: 'Scan the QR code next to any door, or choose your starting point. HallFinder works out the rest.', art: <PlazaScene className="aspect-[4/3] w-full rounded-2xl" /> },
  { title: 'Follow the route', text: 'The floor plan lights up your path with plain steps: corridors, stairs, lifts and doors. Switch to step-free routes any time.', art: <MiniMap className="w-full rounded-2xl" /> },
  { title: 'Never miss a class', text: 'Your timetable sends a reminder with the hall and directions. If a hall changes, you hear about it straight away.', art: <ClassroomScene className="aspect-[4/3] w-full rounded-2xl" /> },
];

export default function Onboarding({ open, onDone }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <Modal open={open} onClose={onDone} title={s.title}
      footer={(
        <div className="flex items-center justify-between gap-3">
          <button className="btn-ghost" onClick={onDone}>Skip</button>
          <div className="flex gap-1.5" aria-hidden="true">{SLIDES.map((_, k) => <span key={k} className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-teal' : 'w-2 bg-line'}`} />)}</div>
          <button className="btn-primary" onClick={() => (last ? onDone() : setI(i + 1))}>{last ? 'Get started' : 'Next'}</button>
        </div>
      )}>
      <div className="overflow-hidden rounded-2xl">{s.art}</div>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">{s.text}</p>
    </Modal>
  );
}
