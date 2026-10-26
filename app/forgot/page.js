'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';
import { api } from '@/lib/api';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <AuthLayout title="Reset your password" sub="Enter your email and we will send you a link.">
      {msg ? (
        <div className="space-y-4"><p className="rounded-xl bg-teal-soft px-4 py-3 text-sm text-teal-ink">{msg}</p><Link href="/login" className="btn-primary w-full">Back to sign in</Link></div>
      ) : (
        <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const d = await api('/auth/forgot', { method: 'POST', body: { email } }); setMsg(d.message); }}>
          <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <button className="btn-primary w-full">Send reset link</button>
          <p className="text-center text-sm text-muted"><Link href="/login" className="font-semibold text-teal-ink hover:underline">Back to sign in</Link></p>
        </form>
      )}
    </AuthLayout>
  );
}
