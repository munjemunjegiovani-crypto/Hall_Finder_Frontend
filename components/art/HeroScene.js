'use client';
import { useEffect, useState } from 'react';
import Kid from './Kid';
import { Cloud, BlossomTree, Hedge, SchoolBlock } from './parts';

const STARS = Array.from({ length: 46 }, (_, i) => {
  const a = (i * 9301 + 49297) % 233280;
  return { x: (a % 1600), y: ((a * 7) % 420) + 10, r: 1 + (i % 3) * 0.7, d: (i % 7) * 0.45 };
});
const v = (n) => `var(--${n})`;

/**
 * Cinematic 2D school scene (flat colour, soft gradients, glowing light), inspired by
 * anime backgrounds. All colours come from CSS variables so it turns into a blue-hour
 * evening scene in dark mode.
 */
export default function HeroScene({ className = '' }) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 820);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const vb = narrow ? '700 170 860 730' : '0 0 1600 900';
  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMax slice" className={className} role="img" aria-label="Illustration of students walking toward a school with a clock tower under a glowing sky">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sky-top)" /><stop offset=".55" stopColor="var(--sky-mid)" /><stop offset="1" stopColor="var(--sky-low)" />
        </linearGradient>
        <radialGradient id="glow"><stop offset="0" stopColor="var(--sun-glow)" /><stop offset="1" stopColor="var(--sun-glow)" stopOpacity="0" /></radialGradient>
        <linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--grass-a)" /><stop offset="1" stopColor="var(--grass-b)" /></linearGradient>
        <linearGradient id="ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <linearGradient id="path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3EADF" /><stop offset="1" stopColor="#E3D6C6" /></linearGradient>
        <linearGradient id="pathDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3C4780" /><stop offset="1" stopColor="#2B3566" /></linearGradient>
      </defs>

      <rect x="-200" y="-100" width="2000" height="1100" fill="url(#sky)" />
      {/* stars (dark mode only) */}
      <g style={{ opacity: v('stars') }}>
        {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" className="animate-twinkle" style={{ animationDelay: `${s.d}s` }} />)}
      </g>
      {/* sun / moon */}
      <circle cx="1390" cy="230" r="320" fill="url(#glow)" />
      <circle cx="1390" cy="230" r="50" style={{ fill: v('sun') }} />
      {/* light rays */}
      <g style={{ mixBlendMode: 'soft-light' }} opacity=".7">
        <polygon points="1390,230 760,900 960,900" fill="url(#ray)" opacity=".35" />
        <polygon points="1390,230 1060,900 1200,900" fill="url(#ray)" opacity=".28" />
        <polygon points="1390,230 1330,900 1500,900" fill="url(#ray)" opacity=".26" />
      </g>
      {/* clouds */}
      <g className="animate-drift" style={{ animationDuration: '55s' }}>
        <Cloud x={380} y={170} s={1.25} opacity=".95" />
        <Cloud x={1450} y={110} s={.8} opacity=".9" />
      </g>
      <g className="animate-drift" style={{ animationDuration: '70s', animationDirection: 'alternate-reverse' }}>
        <Cloud x={820} y={330} s={.9} opacity=".85" />
        <Cloud x={120} y={400} s={.7} opacity=".8" />
        <Cloud x={1130} y={430} s={1.05} opacity=".7" />
      </g>
      {/* far hills + skyline */}
      <path d="M-100 640 C150 560 320 600 520 575 C760 545 900 610 1160 570 C1360 540 1500 590 1700 560 L1700 760 L-100 760Z" style={{ fill: v('hill-far') }} opacity=".75" />
      <g style={{ fill: v('hill-near') }} opacity=".8">
        <rect x="150" y="590" width="40" height="110" /><rect x="196" y="560" width="34" height="140" /><rect x="236" y="604" width="52" height="96" /><rect x="1380" y="580" width="44" height="120" /><rect x="1430" y="548" width="36" height="152" /><rect x="1472" y="596" width="60" height="104" />
      </g>
      <path d="M-100 690 C200 640 400 676 640 660 C900 640 1100 690 1400 660 C1500 650 1600 660 1700 668 L1700 760 L-100 760Z" style={{ fill: v('hill-near') }} />

      {/* school */}
      <SchoolBlock x={820} y={706} w={680} />
      {/* side wing */}
      <g>
        <rect x="560" y="600" width="250" height="106" style={{ fill: v('wall') }} />
        <rect x="546" y="582" width="278" height="26" rx="4" style={{ fill: v('roof') }} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={584 + i * 56} y={622} width="34" height="48" rx="2" style={{ fill: v('win') }} />)}
      </g>

      {/* lawn + hedges + path */}
      <path d="M-100 706 L1700 706 L1700 1000 L-100 1000Z" fill="url(#lawn)" />
      <Hedge x={560} y={684} w={250} h={38} />
      <Hedge x={1170} y={690} w={330} h={34} />
      <g>
        <path d="M-100 800 L1700 770 L1700 1000 L-100 1000Z" fill="url(#path)" className="dark:hidden" />
        <path d="M-100 800 L1700 770 L1700 1000 L-100 1000Z" fill="url(#pathDark)" style={{ opacity: v('stars') }} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => <path key={i} d={`M${i * 150 - 40} ${810 - i * 2.2} L${i * 150 - 90} 1000`} stroke="#fff" strokeOpacity=".18" strokeWidth="2" />)}
      </g>
      {/* centre walkway to the door */}
      <path d="M1090 706 L1250 706 L1400 800 L940 800Z" style={{ fill: v('walk') }} opacity=".95" />

      {/* trees */}
      <BlossomTree x={70} y={740} s={.62} />
      <BlossomTree x={1560} y={760} s={1.02} />
      <BlossomTree x={690} y={722} s={.6} />

      {/* students: feet land on the path, bigger and closer = lower on screen */}
      <g>
        <Kid inline x={700} y={856 - 0.952 * 292} height={292} gender="girl" hair="black" style="long" skin="tan" top="#1B3A8F" accent="#0D9488" bottomColor="#27304F" bag="#F5A524" pose="phone" />
        <Kid inline x={880} y={846 - 0.952 * 262} height={262} gender="boy" hair="brown" style="short" skin="light" top="#1B3A8F" accent="#F59E0B" bottomColor="#2A3350" bag="#14B8A6" pose="walk" />
        <Kid inline x={1030} y={872 - 0.952 * 318} height={318} gender="girl" hair="auburn" style="pony" skin="light" top="#1B3A8F" accent="#EC4899" bottomColor="#3B2D6B" bag="#EF6F6C" pose="wave" />
        <Kid inline x={1215} y={850 - 0.952 * 276} height={276} gender="boy" hair="black" style="curly" skin="deep" top="#1B3A8F" accent="#0D9488" bottomColor="#27304F" bag="#6366F1" pose="book" flip />
        <Kid inline x={1370} y={866 - 0.952 * 300} height={300} gender="girl" hair="navy" style="bob" skin="brown" top="#1B3A8F" accent="#F59E0B" bottomColor="#27304F" bag="#0EA5A4" pose="walk" flip />
      </g>

      {/* lamp posts */}
      <g>
        {[1520].map((x) => (
          <g key={x}>
            <rect x={x - 3} y="610" width="6" height="140" fill="#2A3A6B" /><circle cx={x} cy="606" r="12" fill="#FFF3C4" /><circle cx={x} cy="606" r="34" fill="#FFE9A3" opacity=".25" style={{ opacity: `calc(.18 + ${v('stars')} * .5)` }} />
          </g>
        ))}
      </g>

      {/* warm light wash + vignette */}
      <rect x="-200" y="-100" width="2000" height="1100" fill="#FFD7A8" opacity=".10" style={{ mixBlendMode: 'soft-light' }} />
      <rect x="-200" y="-100" width="2000" height="1100" fill="#071044" style={{ opacity: `calc(${v('night-tint')} * .55)`, mixBlendMode: 'multiply' }} />
    </svg>
  );
}
