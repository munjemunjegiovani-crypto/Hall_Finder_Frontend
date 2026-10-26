import Link from 'next/link';

export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2447B5" /><stop offset="1" stopColor="#0A1A4F" /></linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lg)" />
      <path d="M20 7.5c-5.2 0-9 3.9-9 8.7 0 6.2 7.2 13.4 8.2 14.4a1.1 1.1 0 0 0 1.6 0c1-1 8.2-8.2 8.2-14.4 0-4.8-3.8-8.7-9-8.7Z" fill="#fff" />
      <path d="M14.6 17.2 20 12.6l5.4 4.6v5.2h-3.2v-3.2h-4.4v3.2h-3.2Z" fill="#0D9488" />
      <circle cx="31" cy="9" r="3" fill="#2DD4BF" />
    </svg>
  );
}

export default function Logo({ href = '/', light = false, sub = true }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="HallFinder home">
      <LogoMark />
      <span className="leading-none">
        <span className={`block font-display text-[19px] font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>HallFinder</span>
        {sub && <span className={`mt-0.5 block text-[10.5px] font-medium ${light ? 'text-white/70' : 'text-muted'}`}>Campus GPS &amp; timetable</span>}
      </span>
    </Link>
  );
}
