'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { Segmented } from '@/components/ui';
import { useAuth } from '@/components/Providers';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ role: 'student', name: '', email: '', schoolId: '', department: 'Computer Science', level: 2, password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await register({ ...f, level: Number(f.level) }); router.push('/app'); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <AuthLayout title="Create your account" sub="Students and teachers get a personal timetable and reminders.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><span className="label">I am a</span><Segmented value={f.role} onChange={(role) => setF({ ...f, role })} options={[['student', 'Student'], ['teacher', 'Teacher']]} /></div>
        <div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" value={f.name} onChange={set('name')} autoComplete="name" required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" value={f.email} onChange={set('email')} autoComplete="email" required /></div>
          <div><label className="label" htmlFor="sid">{f.role === 'student' ? 'Student ID' : 'Staff ID'}</label><input id="sid" className="input mono" value={f.schoolId} onChange={set('schoolId')} required /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="dept">Department</label>
            <select id="dept" className="input" value={f.department} onChange={set('department')}>{['Computer Science', 'Engineering', 'Business'].map((d) => <option key={d}>{d}</option>)}</select></div>
          {f.role === 'student' && <div><label className="label" htmlFor="lvl">Level</label>
            <select id="lvl" className="input" value={f.level} onChange={set('level')}>{[1, 2, 3, 4].map((l) => <option key={l} value={l}>Level {l}</option>)}</select></div>}
        </div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" className="input" value={f.password} onChange={set('password')} autoComplete="new-password" minLength={6} required /><p className="mt-1 text-xs text-muted">At least 6 characters.</p></div>
        {err && <p className="rounded-xl bg-bad/10 px-3 py-2.5 text-sm" role="alert">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}Create account</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already registered? <Link href="/login" className="font-semibold text-teal-ink hover:underline">Sign in</Link></p>
    </AuthLayout>
  );
}
