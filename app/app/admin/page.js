'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminConsole from '@/components/admin/AdminConsole';
import { useAuth } from '@/components/Providers';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (user && user.role !== 'admin') router.replace('/app'); }, [user, router]);
  return user?.role === 'admin' ? <AdminConsole /> : null;
}
