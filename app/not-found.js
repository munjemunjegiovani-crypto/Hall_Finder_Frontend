import Link from 'next/link';
import { LostKid } from '@/components/art/Scenes';
import Logo from '@/components/Logo';
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <Logo />
      <LostKid className="mt-6 w-72" />
      <h1 className="text-3xl font-extrabold">This page is off the map</h1>
      <p className="max-w-sm text-muted">The link may be old or mistyped. Head back and search for the hall instead.</p>
      <Link href="/" className="btn-primary mt-2">Back to home</Link>
    </div>
  );
}
