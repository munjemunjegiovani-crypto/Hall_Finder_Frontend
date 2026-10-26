'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import DemoButton from '@/components/DemoButton';
import { useAuth } from '@/components/Providers';

function Form() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get('next') || '/app';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(email, password); router.push(next); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <AuthLayout title="Welcome back" sub="Sign in to see your next class and find your way.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" required /></div>
        <div>
          <div className="flex items-center justify-between"><label className="label" htmlFor="pw">Password</label><Link href="/forgot" className="mb-1.5 text-sm font-medium text-teal-ink hover:underline">Forgot password?</Link></div>
          <div className="relative"><input id="pw" type={show ? 'text' : 'password'} autoComplete="current-password" className="input pr-12" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:bg-surface2" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        </div>
        {err && <p className="rounded-xl bg-bad/10 px-3 py-2.5 text-sm text-ink" role="alert">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}Sign in</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or try the demo<span className="h-px flex-1 bg-line" /></div>
      <div className="grid grid-cols-3 gap-2">
        {['student', 'teacher', 'admin'].map((r) => <DemoButton key={r} role={r} next={next} className="btn-ghost !px-2 capitalize">{r}</DemoButton>)}
      </div>
      <p className="mt-8 text-center text-sm text-muted">New here? <Link href="/register" className="font-semibold text-teal-ink hover:underline">Create an account</Link></p>
    </AuthLayout>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
