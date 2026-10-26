'use client';
// Falling blossom petals: pure CSS, a handful of elements, paused for reduced-motion users.
const PETALS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`, delay: `${-((i * 1.9) % 14)}s`, dur: `${11 + (i % 5) * 2.2}s`, size: 8 + (i % 4) * 3, op: 0.55 + (i % 3) * 0.15,
}));
export default function Petals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span key={i} className="absolute -top-4 block animate-petal rounded-[60%_0_60%_0]"
          style={{ left: p.left, width: p.size, height: p.size * 0.7, background: 'var(--petal)', opacity: p.op, animationDelay: p.delay, animationDuration: p.dur }} />
      ))}
    </div>
  );
}
