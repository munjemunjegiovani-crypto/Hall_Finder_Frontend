import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { PlazaScene } from '@/components/art/Scenes';
import Petals from '@/components/art/Petals';

export default function AuthLayout({ title, sub, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between"><Logo /><ThemeToggle /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {sub && <p className="mt-2 text-muted">{sub}</p>}
          <div className="mt-7">{children}</div>
        </div>
        <p className="text-center text-xs text-muted">By continuing you agree to use this demo responsibly. <Link href="/" className="underline">Back to home</Link></p>
      </div>
      <div className="relative hidden overflow-hidden bg-[var(--sky-top)] lg:block grain">
        <PlazaScene className="absolute inset-0 h-full w-full" />
        <Petals />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A1A4F]/90 to-transparent p-10 pt-24 text-white">
          <p className="max-w-md font-display text-2xl font-bold leading-snug">Know which hall, which floor and which door, before you leave your seat.</p>
        </div>
      </div>
    </div>
  );
}
