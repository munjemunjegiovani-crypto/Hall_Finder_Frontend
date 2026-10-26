'use client';
// Reusable pieces for the 2D illustrations: clouds, blossom trees, school buildings, hedges.
const v = (name) => `var(--${name})`;

export function Cloud({ x, y, s = 1, opacity = 1, className = '', style }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} className={className} style={style}>
      <g>
        <ellipse cx="0" cy="30" rx="150" ry="30" style={{ fill: v('cloud-lo') }} />
        <circle cx="-70" cy="10" r="42" style={{ fill: v('cloud-hi') }} />
        <circle cx="-10" cy="-8" r="58" style={{ fill: v('cloud-hi') }} />
        <circle cx="62" cy="6" r="46" style={{ fill: v('cloud-hi') }} />
        <circle cx="110" cy="22" r="30" style={{ fill: v('cloud-hi') }} />
      </g>
    </g>
  );
}

export function BlossomTree({ x, y, s = 1 }) {
  const blobs = [[-70, -250, 62], [0, -290, 74], [72, -246, 60], [-110, -190, 52], [110, -188, 54], [-30, -210, 70], [40, -200, 64], [0, -160, 54]];
  const hi = [[-84, -266, 22], [-8, -312, 26], [56, -266, 20], [-40, -226, 24], [30, -218, 18]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-16 0 C-10 -80 -22 -140 -34 -196 L-18 -200 C-10 -150 0 -110 6 -80 C14 -120 34 -160 66 -196 L78 -186 C48 -150 26 -100 22 0Z" style={{ fill: v('trunk') }} />
      <path d="M-4 0 C0 -60 -6 -110 -14 -160" stroke="#fff" strokeOpacity=".12" strokeWidth="4" fill="none" />
      {blobs.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} style={{ fill: v(i % 2 ? 'leaf-b' : 'leaf-a') }} />)}
      {hi.map(([cx, cy, r], i) => <circle key={`h${i}`} cx={cx} cy={cy} r={r} fill="#fff" opacity=".22" />)}
      {[[-60, -200], [20, -250], [90, -210], [-20, -170], [60, -160], [-100, -150], [10, -300]].map(([cx, cy], i) => <circle key={`d${i}`} cx={cx} cy={cy} r="5" fill="#fff" opacity=".55" />)}
    </g>
  );
}

export function Hedge({ x, y, w, h = 46 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2.6} style={{ fill: v('grass-b') }} />
      <rect x={x} y={y} width={w} height={h * 0.38} rx={h / 3} fill="#fff" opacity=".12" />
    </g>
  );
}

export function WindowGrid({ x, y, cols, rows, w = 38, h = 54, gx = 24, gy = 30, lit = false }) {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const wx = x + c * (w + gx), wy = y + r * (h + gy);
    out.push(
      <g key={`${r}-${c}`}>
        <rect x={wx - 4} y={wy - 4} width={w + 8} height={h + 8} rx="3" style={{ fill: v('wall-shade') }} />
        <rect x={wx} y={wy} width={w} height={h} rx="2" style={{ fill: v('win') }} />
        <path d={`M${wx} ${wy + h} L${wx + w * 0.55} ${wy} L${wx + w * 0.8} ${wy} L${wx + w * 0.25} ${wy + h}Z`} fill="#fff" opacity=".35" />
        <path d={`M${wx + w / 2} ${wy} V${wy + h} M${wx} ${wy + h / 2} H${wx + w}`} stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
      </g>,
    );
  }
  return <g>{out}</g>;
}

/** A school block with a clock tower. Used big in the hero and small in gallery scenes. */
export function SchoolBlock({ x, y, w = 700, tower = true, roof, wallVar = 'wall', flag = true }) {
  const bodyH = 230;
  const cx = x + w / 2;
  const cols = Math.max(3, Math.floor((w - 140) / 2 / 62));
  return (
    <g>
      {/* body */}
      <rect x={x} y={y - bodyH} width={w} height={bodyH} style={{ fill: v(wallVar) }} />
      <rect x={x + w * 0.72} y={y - bodyH} width={w * 0.28} height={bodyH} style={{ fill: v('wall-shade') }} opacity=".55" />
      <rect x={x} y={y - 22} width={w} height="22" style={{ fill: v('wall-shade') }} />
      {/* roof band */}
      <rect x={x - 14} y={y - bodyH - 34} width={w + 28} height="38" rx="4" style={{ fill: roof || v('roof') }} />
      <rect x={x - 14} y={y - bodyH + 2} width={w + 28} height="8" style={{ fill: v('roof-shade') }} opacity=".6" />
      <rect x={x - 14} y={y - bodyH - 34} width={w + 28} height="9" rx="4" fill="#fff" opacity=".18" />
      {/* windows left & right of entrance */}
      <WindowGrid x={x + 36} y={y - bodyH + 40} cols={cols} rows={2} />
      <WindowGrid x={x + w - 36 - cols * 62 + 24} y={y - bodyH + 40} cols={cols} rows={2} />
      {/* tower */}
      {tower && (
        <g>
          <rect x={cx - 82} y={y - bodyH - 190} width="164" height="200" style={{ fill: v(wallVar) }} />
          <rect x={cx + 30} y={y - bodyH - 190} width="52" height="200" style={{ fill: v('wall-shade') }} opacity=".55" />
          <polygon points={`${cx - 100},${y - bodyH - 188} ${cx + 100},${y - bodyH - 188} ${cx},${y - bodyH - 300}`} style={{ fill: roof || v('roof') }} />
          <polygon points={`${cx},${y - bodyH - 300} ${cx + 100},${y - bodyH - 188} ${cx + 40},${y - bodyH - 188}`} style={{ fill: v('roof-shade') }} opacity=".7" />
          <line x1={cx} y1={y - bodyH - 300} x2={cx} y2={y - bodyH - 340} stroke="#C7CFE8" strokeWidth="4" />
          {flag && <path d={`M${cx} ${y - bodyH - 338} q22 -10 40 2 q-18 10 -40 4Z`} fill="#0D9488" className="animate-bob" />}
          <circle cx={cx} cy={y - bodyH - 120} r="42" fill="#fff" stroke="#C9D3EC" strokeWidth="6" />
          <circle cx={cx} cy={y - bodyH - 120} r="36" fill="none" stroke="#1B2A6B" strokeOpacity=".25" strokeWidth="1.5" />
          {[0, 90, 180, 270].map((a) => <line key={a} x1={cx} y1={y - bodyH - 120 - 31} x2={cx} y2={y - bodyH - 120 - 26} stroke="#1B2A6B" strokeWidth="3" transform={`rotate(${a} ${cx} ${y - bodyH - 120})`} />)}
          <line x1={cx} y1={y - bodyH - 120} x2={cx} y2={y - bodyH - 148} stroke="#1B2A6B" strokeWidth="4" strokeLinecap="round" />
          <line x1={cx} y1={y - bodyH - 120} x2={cx + 20} y2={y - bodyH - 108} stroke="#0D9488" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx} cy={y - bodyH - 120} r="4" fill="#1B2A6B" />
          <path d={`M${cx - 18} ${y - bodyH - 40} h36 v32 h-36z`} style={{ fill: v('win') }} /><path d={`M${cx - 18} ${y - bodyH - 24} h36 M${cx} ${y - bodyH - 40} v32`} stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
        </g>
      )}
      {/* portico */}
      <g>
        <polygon points={`${cx - 118},${y - 150} ${cx + 118},${y - 150} ${cx},${y - 206}`} style={{ fill: v('wall') }} stroke={'rgba(0,0,0,.08)'} />
        <polygon points={`${cx},${y - 206} ${cx + 118},${y - 150} ${cx + 40},${y - 150}`} style={{ fill: v('wall-shade') }} opacity=".6" />
        <rect x={cx - 124} y={y - 152} width="248" height="14" style={{ fill: v('wall-shade') }} />
        {[-100, -48, 48, 100].map((dx) => (
          <g key={dx}>
            <rect x={cx + dx - 9} y={y - 138} width="18" height={116} style={{ fill: v('wall') }} />
            <rect x={cx + dx + 2} y={y - 138} width="7" height={116} style={{ fill: v('wall-shade') }} opacity=".7" />
          </g>
        ))}
        <rect x={cx - 38} y={y - 118} width="76" height="96" rx="5" style={{ fill: v('roof-shade') }} />
        <rect x={cx - 34} y={y - 114} width="32" height="92" rx="3" style={{ fill: v('win') }} /><rect x={cx + 2} y={y - 114} width="32" height="92" rx="3" style={{ fill: v('win') }} />
        <path d={`M${cx - 34} ${y - 22} L${cx - 10} ${y - 114} H${cx - 2} L${cx - 26} ${y - 22}Z`} fill="#fff" opacity=".35" />
        <path d={`M${cx - 130} ${y} h260 v10 h-260z M${cx - 144} ${y + 10} h288 v10 h-288z M${cx - 158} ${y + 20} h316 v10 h-316z`} style={{ fill: v('wall-shade') }} />
      </g>
    </g>
  );
}

/** Tiny building used in the "campus" gallery tiles. */
export function MiniBuilding({ x, y, w, h, wall = 'wall', roof, windows = 3 }) {
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} style={{ fill: v(wall) }} />
      <rect x={x + w * 0.7} y={y - h} width={w * 0.3} height={h} style={{ fill: v('wall-shade') }} opacity=".5" />
      <rect x={x - 6} y={y - h - 14} width={w + 12} height="16" rx="3" style={{ fill: roof || v('roof') }} />
      {Array.from({ length: windows }).map((_, i) => <rect key={i} x={x + 14 + i * ((w - 28) / windows)} y={y - h + 18} width={(w - 28) / windows - 10} height={h * 0.36} rx="2" style={{ fill: v('win') }} />)}
      <rect x={x + w / 2 - 12} y={y - 34} width="24" height="34" rx="2" style={{ fill: v('roof-shade') }} />
    </g>
  );
}
