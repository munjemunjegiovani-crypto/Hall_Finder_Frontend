'use client';
import { useId } from 'react';

/**
 * Flat, cel-shaded "anime" student drawn in plain SVG (no image files, works offline).
 * Local coordinates: 100 wide x 250 tall. Use <Kid height={220} /> to scale.
 */
const SKINS = { light: '#FFDFC8', tan: '#F0BC96', brown: '#C98C62', deep: '#8D5A3C' };
const HAIRS = { black: '#1E2235', brown: '#5A3A2E', auburn: '#8A3F2B', blonde: '#E4B86A', navy: '#2A3A7A', pink: '#E58AB4', teal: '#2A8C8C' };

export default function Kid({
  height = 220, skin = 'tan', hair = 'black', style: hairStyle = 'short', gender = 'boy',
  top = '#1E3A8A', accent = '#0D9488', bottomColor = '#27304F', bag = '#F59E0B',
  pose = 'stand', flip = false, shadow = true, className = '', inline = false, x = 0, y = 0,
}) {
  const id = useId().replace(/:/g, '');
  const sk = SKINS[skin] || skin;
  const hr = HAIRS[hair] || hair;
  const skShade = 'rgba(120,50,30,.16)';
  const girl = gender === 'girl';
  const walking = pose === 'walk';
  const legL = walking ? -9 : 0;
  const legR = walking ? 9 : 0;

  const hairBack = {
    long: <path d="M25 38 C18 8 82 8 75 38 L82 104 Q50 116 18 104Z" fill={hr} />,
    bob: <path d="M24 36 C20 8 80 8 76 36 L79 66 Q50 76 21 66Z" fill={hr} />,
    pony: <path d="M70 22 C98 14 100 76 74 92 C86 64 80 42 66 34Z" fill={hr} />,
    curly: <g fill={hr}>{[[30, 24, 13], [44, 14, 14], [58, 14, 14], [70, 24, 13], [26, 38, 11], [74, 38, 11], [50, 18, 15]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>,
    short: null,
  }[hairStyle];

  const hairFront = (
    <g>
      <path d="M28 40 C23 13 44 6 56 8 C71 10 78 26 72 44 C70 35 65 29 57 27 C51 35 38 34 28 40Z" fill={hr} />
      <path d="M33 22 C40 14 52 12 62 15" stroke="#fff" strokeOpacity=".4" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {hairStyle === 'short' && <path d="M44 9 L48 2 L53 9Z" fill={hr} />}
    </g>
  );

  // arms by pose
  const sleeve = { stroke: top, strokeWidth: 12, strokeLinecap: 'round', fill: 'none' };
  const arms = {
    stand: (<><path d="M35 76 Q25 100 28 122" {...sleeve} /><path d="M65 76 Q75 100 72 122" {...sleeve} /><circle cx="28" cy="128" r="5.5" fill={sk} /><circle cx="72" cy="128" r="5.5" fill={sk} /></>),
    walk: (<><path d="M35 76 Q24 98 31 118" {...sleeve} /><path d="M65 76 Q76 98 70 120" {...sleeve} /><circle cx="31" cy="124" r="5.5" fill={sk} /><circle cx="70" cy="126" r="5.5" fill={sk} /></>),
    wave: (<><path d="M35 76 Q25 100 28 122" {...sleeve} /><path d="M65 76 Q86 74 86 46" {...sleeve} /><circle cx="28" cy="128" r="5.5" fill={sk} /><circle cx="86" cy="39" r="6" fill={sk} /></>),
    phone: (<>
      <path d="M35 76 Q25 100 28 122" {...sleeve} />
      <circle cx="28" cy="128" r="5.5" fill={sk} />
      <path d="M65 78 Q80 98 60 106" {...sleeve} />
      <g transform="rotate(-12 60 96)"><rect x="54" y="82" width="13" height="22" rx="3" fill="#10172E" /><rect x="55.5" y="84" width="10" height="18" rx="2" fill="#2DD4BF" /><path d="M60.5 89 a3 3 0 1 1 .01 0 L60.5 97Z" fill="#fff" /></g>
      <circle cx="60" cy="106" r="5.2" fill={sk} />
    </>),
    book: (<>
      <rect x="30" y="92" width="40" height="28" rx="3" fill={accent} /><rect x="30" y="92" width="40" height="5" rx="2" fill="#fff" opacity=".35" /><path d="M36 100h28M36 106h20" stroke="#fff" strokeOpacity=".6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M35 76 Q22 98 40 112" {...sleeve} /><path d="M65 76 Q78 98 60 112" {...sleeve} />
      <circle cx="40" cy="114" r="5" fill={sk} /><circle cx="60" cy="114" r="5" fill={sk} />
    </>),
  }[pose];

  const lowerBody = girl ? (
    <>
      {/* legs */}
      <g transform={`rotate(${legL} 42 170)`}><rect x="37" y="168" width="9" height="62" rx="4" fill={sk} /><rect x="37" y="205" width="9" height="25" fill="#F4F6FF" /><path d="M35 228 h14 a3 3 0 0 1 3 3 v3 h-20z" fill="#1A1F36" /></g>
      <g transform={`rotate(${legR} 58 170)`}><rect x="54" y="168" width="9" height="62" rx="4" fill={sk} /><rect x="54" y="205" width="9" height="25" fill="#F4F6FF" /><path d="M52 228 h14 a3 3 0 0 1 3 3 v3 h-20z" fill="#1A1F36" /></g>
      {/* pleated skirt */}
      <path d="M32 122 L68 122 L79 172 Q50 182 21 172Z" fill={bottomColor} />
      <path d="M32 122 L68 122 L70 135 L30 135Z" fill="#000" opacity=".12" />
      {[33, 41, 50, 59, 67].map((x, i) => <path key={i} d={`M${x} 130 L${x + (x - 50) * 0.55} 176`} stroke="#fff" strokeOpacity=".14" strokeWidth="1.3" />)}
      <path d="M24 164 Q50 173 76 164" stroke={accent} strokeOpacity=".9" strokeWidth="2.2" fill="none" />
    </>
  ) : (
    <>
      <g transform={`rotate(${legL} 42 126)`}><path d="M34 124 L50 124 L48 228 L36 228Z" fill={bottomColor} /><path d="M33 228 h17 a3 3 0 0 1 3 3 v4 h-22z" fill="#F4F6FF" /><path d="M33 232 h20 v4 h-20z" fill="#1A1F36" /></g>
      <g transform={`rotate(${legR} 58 126)`}><path d="M50 124 L66 124 L64 228 L52 228Z" fill={bottomColor} /><path d="M50 228 h17 a3 3 0 0 1 3 3 v4 h-22z" fill="#F4F6FF" /><path d="M50 232 h20 v4 h-20z" fill="#1A1F36" /></g>
      <path d="M34 124 L66 124 L66 134 L34 134Z" fill="#000" opacity=".14" />
    </>
  );

  const inner = (
    <>
      <defs>
        <clipPath id={`h${id}`}><path d="M29 36 C29 18 71 18 71 36 C71 50 62 63 50 63 C38 63 29 50 29 36Z" /></clipPath>
        <clipPath id={`b${id}`}><path d="M34 70 Q50 64 66 70 L68 128 Q50 134 32 128Z" /></clipPath>
      </defs>
      {shadow && <ellipse cx="50" cy="238" rx="32" ry="5" fill="#0A1450" opacity=".28" />}
      {/* backpack */}
      <rect x="27" y="74" width="46" height="54" rx="11" fill={bag} />
      <rect x="27" y="74" width="46" height="54" rx="11" fill="#000" opacity=".1" />
      <rect x="35" y="104" width="30" height="16" rx="4" fill={bag} stroke="#000" strokeOpacity=".12" />
      {hairBack}
      {lowerBody}
      {/* torso */}
      <path d="M34 70 Q50 64 66 70 L68 128 Q50 134 32 128Z" fill={top} />
      <g clipPath={`url(#b${id})`}><rect x="52" y="60" width="22" height="80" fill="#000" opacity=".16" /><rect x="30" y="60" width="4" height="80" fill="#fff" opacity=".12" /></g>
      <path d="M43 65 L50 86 L57 65Z" fill="#F7F9FF" />
      <path d="M43 65 L36 76 L45 84 L50 86Z M57 65 L64 76 L55 84 L50 86Z" fill={top} stroke="#fff" strokeOpacity=".18" />
      <path d="M48.3 76 L51.7 76 L53 100 L50 105 L47 100Z" fill={accent} />
      <rect x="55" y="96" width="9" height="6" rx="1.5" fill="#fff" opacity=".85" /><circle cx="59.5" cy="99" r="1.6" fill={accent} />
      {arms}
      {/* neck + head */}
      <rect x="45" y="56" width="10" height="14" rx="4" fill={sk} /><rect x="45" y="58" width="10" height="6" fill={skShade} />
      <path d="M29 36 C29 18 71 18 71 36 C71 50 62 63 50 63 C38 63 29 50 29 36Z" fill={sk} />
      <g clipPath={`url(#h${id})`}><rect x="52" y="14" width="22" height="54" fill={skShade} /></g>
      {/* ears */}
      <ellipse cx="29" cy="45" rx="3.2" ry="4.6" fill={sk} /><ellipse cx="71" cy="45" rx="3.2" ry="4.6" fill={sk} />
      {/* face */}
      <g>
        <ellipse cx="41" cy="45" rx="3.7" ry="5.6" fill="#1B2140" /><ellipse cx="59" cy="45" rx="3.7" ry="5.6" fill="#1B2140" />
        <ellipse cx="41" cy="47.2" rx="2.6" ry="3" fill="#5B86E0" opacity=".85" /><ellipse cx="59" cy="47.2" rx="2.6" ry="3" fill="#5B86E0" opacity=".85" />
        <circle cx="42.4" cy="42.8" r="1.5" fill="#fff" /><circle cx="60.4" cy="42.8" r="1.5" fill="#fff" /><circle cx="39.8" cy="48" r=".7" fill="#fff" opacity=".8" /><circle cx="57.8" cy="48" r=".7" fill="#fff" opacity=".8" />
        <path d="M36.5 38.5 Q41 36 45 38" stroke={hr} strokeWidth="1.6" fill="none" strokeLinecap="round" /><path d="M55 38 Q59 36 63.5 38.5" stroke={hr} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M46.5 55 Q50 58.5 53.5 55" stroke="#B4514E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="35.5" cy="52" rx="4" ry="2.2" fill="#FF7F98" opacity=".34" /><ellipse cx="64.5" cy="52" rx="4" ry="2.2" fill="#FF7F98" opacity=".34" />
        <path d="M50 49.5 q-1 2.2 .8 2.4" stroke={skShade} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      </g>
      {hairFront}
    </>
  );
  if (inline) {
    const sc = height / 250;
    return <g transform={`translate(${flip ? x + 100 * sc : x} ${y}) scale(${flip ? -sc : sc} ${sc})`} className={`kid-art ${className}`}>{inner}</g>;
  }
  return (
    <svg viewBox="0 0 100 250" height={height} width={(height * 100) / 250} className={`kid-art ${className}`} style={{ overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      {inner}
    </svg>
  );
}
