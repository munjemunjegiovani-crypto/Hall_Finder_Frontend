'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth, useToast } from '@/components/Providers';

export const DEMO_ACCOUNTS = {
  student: { email: 'student@hallfinder.demo', label: 'Student' },
  teacher: { email: 'teacher@hallfinder.demo', label: 'Teacher' },
  admin: { email: 'admin@hallfinder.demo', label: 'Admin' },
};

/** One click sign-in with a demo account. The password is public on purpose: this is a demo. */
export default function DemoButton({ role = 'student', className = 'btn-primary', children, next = '/app' }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await login(DEMO_ACCOUNTS[role].email, 'demo1234');
          router.push(next);
        } catch (e) {
          toast(e.message, 'error');
          setBusy(false);
        }
      }}
    >
      {busy && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
