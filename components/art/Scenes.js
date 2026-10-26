'use client';
import Kid from './Kid';
import { Cloud, MiniBuilding, BlossomTree } from './parts';

const v = (n) => `var(--${n})`;
const Frame = ({ children, label, className = '', vb = '0 0 400 300' }) => (
  <svg viewBox={vb} className={className} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--sky-top)" /><stop offset="1" stopColor="var(--sky-low)" /></linearGradient>
      <linearGradient id="fl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--room-floor)" /><stop offset="1" stopColor="var(--wood2)" /></linearGradient>
    </defs>
    {children}
  </svg>
);

const Desk = ({ x, y, w = 110 }) => (
  <g>
    <rect x={x} y={y} width={w} height="12" rx="3" style={{ fill: v('wood') }} />
    <rect x={x} y={y} width={w} height="4" rx="2" fill="#fff" opacity=".25" />
    <rect x={x + 8} y={y + 12} width="6" height="34" style={{ fill: v('wood2') }} /><rect x={x + w - 14} y={y + 12} width="6" height="34" style={{ fill: v('wood2') }} />
  </g>
);

/** Kids in a bright classroom with a green board and a window. */
export function ClassroomScene({ className }) {
  return (
    <Frame label="Illustration of students in a classroom" className={className}>
      <rect width="400" height="300" style={{ fill: v('room-wall') }} />
      <rect y="0" width="400" height="40" style={{ fill: v('room-wall2') }} />
      <rect y="214" width="400" height="86" fill="url(#fl2)" />
      <rect x="28" y="40" width="190" height="104" rx="6" style={{ fill: '#cfd8e8' }} /><rect x="34" y="46" width="178" height="92" rx="4" style={{ fill: v('board') }} />
      <path d="M48 70h60M48 86h96M48 102h40" stroke="#fff" strokeOpacity=".75" strokeWidth="3" strokeLinecap="round" />
      <circle cx="170" cy="94" r="16" fill="none" stroke="#7EE7D8" strokeWidth="3" /><path d="M170 82v24M158 94h24" stroke="#7EE7D8" strokeWidth="2.5" />
      <rect x="248" y="40" width="124" height="96" rx="6" fill="url(#sk2)" stroke="#fff" strokeWidth="6" /><path d="M310 40v96M248 88h124" stroke="#fff" strokeWidth="4" />
      <circle cx="338" cy="66" r="14" style={{ fill: v('sun') }} /><Cloud x={290} y={84} s={.22} />
      <Kid inline x={40} y={118} height={150} gender="girl" hair="black" style="long" skin="tan" top="#1B3A8F" accent="#0D9488" bag="#F5A524" pose="stand" shadow={false} />
      <Desk x={22} y={206} w={120} />
      <Kid inline x={168} y={110} height={156} gender="boy" hair="brown" style="short" skin="light" top="#1B3A8F" accent="#F59E0B" bag="#14B8A6" pose="wave" shadow={false} />
      <Desk x={150} y={208} w={120} />
      <Kid inline x={292} y={120} height={146} gender="girl" hair="auburn" style="pony" skin="brown" top="#1B3A8F" accent="#EC4899" bag="#6366F1" pose="book" shadow={false} />
      <Desk x={276} y={206} w={116} />
    </Frame>
  );
}

/** Students on the plaza following a route on a phone. */
export function PlazaScene({ className }) {
  return (
    <Frame label="Illustration of two students following a route on a phone" className={className}>
      <rect width="400" height="300" fill="url(#sk2)" />
      <circle cx="320" cy="56" r="26" style={{ fill: v('sun') }} /><circle cx="320" cy="56" r="80" fill="var(--sun-glow)" opacity=".5" />
      <Cloud x={90} y={60} s={.32} /><Cloud x={250} y={110} s={.22} opacity=".85" />
      <path d="M0 190 C90 168 170 192 260 176 C330 164 370 176 400 172 V230 H0Z" style={{ fill: v('hill-near') }} />
      <MiniBuilding x={30} y={200} w={120} h={70} roof="#1B3A8F" windows={4} />
      <MiniBuilding x={250} y={200} w={120} h={90} wall="wall" roof="#0D9488" windows={3} />
      <rect y="200" width="400" height="100" fill="url(#lawn)" /><rect y="200" width="400" height="100" style={{ fill: v('grass-a') }} />
      <path d="M0 250 L400 238 V300 H0Z" style={{ fill: v('walk') }} />
      {/* route line + pin */}
      <path d="M120 262 C170 232 210 258 262 214" stroke="#0D9488" strokeWidth="4" strokeDasharray="9 8" strokeLinecap="round" fill="none" className="route-line" />
      <g className="animate-bob"><path d="M262 168c-12 0-21 9-21 21 0 15 18 33 20 35a1.5 1.5 0 0 0 2 0c2-2 20-20 20-35 0-12-9-21-21-21Z" fill="#EF4444" /><circle cx="262" cy="189" r="8" fill="#fff" /></g>
      <Kid inline x={92} y={102} height={180} gender="girl" hair="pink" style="bob" skin="light" top="#1B3A8F" accent="#0D9488" bag="#F5A524" pose="phone" />
      <Kid inline x={156} y={122} height={160} gender="boy" hair="black" style="short" skin="deep" top="#1B3A8F" accent="#F59E0B" bag="#14B8A6" pose="wave" />
      <BlossomTree x={372} y={250} s={.3} />
    </Frame>
  );
}

export function LibraryScene({ className }) {
  const books = ['#0D9488', '#1B3A8F', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#EF6F6C', '#1B3A8F'];
  const Shelf = ({ x, y, w }) => (
    <g>
      <rect x={x} y={y} width={w} height="104" rx="4" style={{ fill: v('shelf') }} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={x + 5} y={y + 6 + r * 33} width={w - 10} height="27" style={{ fill: v('room-wall2') }} />
          {Array.from({ length: Math.floor((w - 14) / 9) }).map((_, i) => <rect key={i} x={x + 8 + i * 9} y={y + 10 + r * 33 + (i % 3)} width="7" height={23 - (i % 3)} rx="1" fill={books[(i + r * 3) % books.length]} />)}
        </g>
      ))}
    </g>
  );
  return (
    <Frame label="Illustration of students in a library" className={className}>
      <rect width="400" height="300" style={{ fill: v('room-wall') }} /><rect y="226" width="400" height="74" fill="url(#fl2)" />
      <Shelf x={16} y={34} w={112} /><Shelf x={144} y={34} w={112} /><Shelf x={272} y={34} w={112} />
      <rect x="150" y="150" width="100" height="22" rx="6" fill="#FFE08A" opacity=".0" />
      <Kid inline x={70} y={118} height={160} gender="girl" hair="brown" style="long" skin="tan" top="#1B3A8F" accent="#EC4899" bag="#0EA5A4" pose="book" shadow={false} />
      <Kid inline x={250} y={124} height={154} gender="boy" hair="blonde" style="short" skin="light" top="#1B3A8F" accent="#0D9488" bag="#EF6F6C" pose="walk" shadow={false} />
      <rect x="130" y="212" width="170" height="14" rx="4" style={{ fill: v('wood') }} /><rect x="146" y="226" width="8" height="40" style={{ fill: v('wood2') }} /><rect x="276" y="226" width="8" height="40" style={{ fill: v('wood2') }} />
      <rect x="168" y="198" width="38" height="14" rx="2" fill="#0D9488" /><rect x="212" y="202" width="30" height="10" rx="2" fill="#F59E0B" />
      <circle cx="350" cy="190" r="26" fill="#FFE9A8" opacity=".35" /><path d="M350 150v36" stroke="#8A97C2" strokeWidth="4" /><path d="M334 190h32l-6-14h-20z" fill="#F59E0B" />
    </Frame>
  );
}

export function LabScene({ className }) {
  const Monitor = ({ x, y }) => (
    <g>
      <rect x={x} y={y} width="62" height="42" rx="4" fill="#10172E" /><rect x={x + 4} y={y + 4} width="54" height="32" rx="2" fill="#14B8A6" opacity=".9" />
      <path d={`M${x + 10} ${y + 12}h26M${x + 10} ${y + 19}h38M${x + 10} ${y + 26}h20`} stroke="#fff" strokeOpacity=".85" strokeWidth="2.5" strokeLinecap="round" />
      <rect x={x + 26} y={y + 42} width="10" height="8" fill="#10172E" /><rect x={x + 16} y={y + 49} width="30" height="4" rx="2" fill="#10172E" />
    </g>
  );
  return (
    <Frame label="Illustration of students working in a computer lab" className={className}>
      <rect width="400" height="300" style={{ fill: v('room-wall') }} /><rect y="226" width="400" height="74" fill="url(#fl2)" />
      <rect x="30" y="30" width="340" height="70" rx="8" style={{ fill: v('board') }} /><path d="M52 52h120M52 70h200M52 86h90" stroke="#7EE7D8" strokeOpacity=".8" strokeWidth="3.5" strokeLinecap="round" />
      <Kid inline x={60} y={108} height={158} gender="boy" hair="black" style="curly" skin="brown" top="#1B3A8F" accent="#F59E0B" bag="#6366F1" pose="stand" shadow={false} />
      <Kid inline x={250} y={104} height={162} gender="girl" hair="teal" style="pony" skin="light" top="#1B3A8F" accent="#0D9488" bag="#F5A524" pose="wave" shadow={false} />
      <rect x="30" y="206" width="340" height="14" rx="4" style={{ fill: v('wood') }} /><rect x="44" y="220" width="8" height="46" style={{ fill: v('wood2') }} /><rect x="348" y="220" width="8" height="46" style={{ fill: v('wood2') }} />
      <Monitor x={46} y={156} /><Monitor x={150} y={156} /><Monitor x={296} y={156} />
    </Frame>
  );
}

/** Illustrated interior used as the banner of a hall detail page. */
export function HallArt({ type = 'lecture', className }) {
  if (type === 'lab') return <LabScene className={className} />;
  if (type === 'library') return <LibraryScene className={className} />;
  if (type === 'seminar' || type === 'office' || type === 'lounge' || type === 'cafeteria') return <ClassroomScene className={className} />;
  // tiered lecture hall / auditorium
  const rows = [0, 1, 2, 3, 4];
  return (
    <Frame label="Illustration of a tiered lecture hall" className={className}>
      <rect width="400" height="300" style={{ fill: v('room-wall') }} />
      <rect y="0" width="400" height="34" style={{ fill: v('room-wall2') }} />
      <rect x="60" y="28" width="280" height="110" rx="8" fill="#F3F6FF" stroke="#C5D0EA" strokeWidth="6" />
      <rect x="72" y="40" width="256" height="86" rx="4" fill="#12296B" />
      <path d="M92 62h110M92 80h150M92 98h80" stroke="#7EE7D8" strokeWidth="5" strokeLinecap="round" />
      <rect x="248" y="58" width="62" height="56" rx="6" fill="#0D9488" opacity=".9" /><path d="M258 100l14-18 12 12 10-16 10 22z" fill="#fff" opacity=".9" />
      <rect y="150" width="400" height="150" fill="url(#fl2)" />
      <Kid inline x={174} y={96} height={110} gender="boy" hair="brown" style="short" skin="tan" top="#1B3A8F" accent="#F59E0B" bag="#14B8A6" pose="wave" shadow={false} />
      <rect x="166" y="170" width="68" height="34" rx="4" style={{ fill: v('wood') }} />
      {rows.map((r) => {
        const y = 196 + r * 22;
        const n = 6 + r * 2;
        const w = 360 - r * 4;
        return (
          <g key={r}>
            <rect x={200 - w / 2} y={y} width={w} height="26" fill="#0B1A55" opacity={0.18 + r * 0.05} />
            {Array.from({ length: n }).map((_, i) => {
              const sw = w / n - 6;
              const x = 200 - w / 2 + 3 + i * (w / n);
              return (
                <g key={i}>
                  <rect x={x} y={y - 8} width={sw} height="20" rx="5" fill={['#2447B5', '#1B3A8F', '#0D9488'][(i + r) % 3]} />
                  <rect x={x + 2} y={y - 8} width={sw - 4} height="6" rx="3" fill="#fff" opacity=".25" />
                </g>
              );
            })}
          </g>
        );
      })}
    </Frame>
  );
}

/** Friendly empty-state / not-found artwork. */
export function LostKid({ className }) {
  return (
    <svg viewBox="0 0 320 240" className={className} role="img" aria-label="A student looking at a map">
      <ellipse cx="160" cy="214" rx="120" ry="14" fill="var(--hill-far)" opacity=".4" />
      <rect x="196" y="70" width="86" height="104" rx="8" fill="#fff" stroke="var(--line)" style={{ fill: 'rgb(var(--surface))' }} />
      <path d="M208 92h62M208 110h40M208 128h54M208 146h30" stroke="rgb(var(--muted))" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
      <g className="animate-bob"><path d="M240 20c-14 0-24 10-24 24 0 17 21 38 23 40a2 2 0 0 0 2 0c2-2 23-23 23-40 0-14-10-24-24-24Z" fill="#EF4444" /><text x="240" y="50" textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff">?</text></g>
      <Kid inline x={70} y={30} height={190} gender="girl" hair="black" style="bob" skin="tan" top="#1B3A8F" accent="#0D9488" bag="#F5A524" pose="phone" />
    </svg>
  );
}
