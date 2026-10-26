// Small static floor-plan picture used on the landing page.
export default function MiniMap({ className }) {
  const room = (x, y, w, h, fill, label, strong) => (
    <g key={label}>
      <rect x={x} y={y} width={w} height={h} rx="8" style={{ fill: `var(--${fill})` }} stroke={strong ? 'rgb(var(--teal))' : 'none'} strokeWidth="3" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="13" fontWeight="700" className="font-mono" style={{ fill: 'var(--map-ink)' }}>{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 420 250" className={className} role="img" aria-label="Floor plan with a highlighted route">
      <rect width="420" height="250" rx="16" style={{ fill: 'var(--map-bg)' }} />
      <rect x="14" y="14" width="392" height="222" rx="12" style={{ fill: 'var(--map-shell)' }} stroke="var(--map-wall)" />
      <rect x="22" y="102" width="376" height="46" style={{ fill: 'var(--map-corr)' }} />
      {room(22, 26, 70, 70, 'r-stairs', 'ST')}
      {room(98, 26, 92, 70, 'r-lecture', 'B201')}
      {room(196, 26, 92, 70, 'r-lab', 'B202')}
      {room(294, 26, 104, 70, 'r-office', 'B203')}
      {room(22, 154, 70, 70, 'r-elevator', 'LIFT')}
      {room(98, 154, 92, 70, 'r-seminar', 'B205')}
      {room(196, 154, 92, 70, 'r-lecture', 'B204', true)}
      {room(294, 154, 104, 70, 'r-restroom', 'WC')}
      <path d="M57 154 V125 H242 V154" stroke="rgb(var(--teal))" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 8" className="route-line" />
      <circle cx="57" cy="125" r="11" fill="rgb(var(--teal))" opacity=".25" className="animate-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      <circle cx="57" cy="125" r="6" fill="#06B6D4" stroke="#fff" strokeWidth="2.5" />
      <g transform="translate(242 150)"><path d="M0 -26c-8 0-14 6-14 14 0 10 12 22 13 23a1 1 0 0 0 2 0c1-1 13-13 13-23 0-8-6-14-14-14Z" fill="#EF4444" /><circle cx="0" cy="-12" r="5" fill="#fff" /></g>
    </svg>
  );
}
