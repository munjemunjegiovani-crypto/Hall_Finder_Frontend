'use client';
import { useAuth } from '@/components/Providers';
import StudentDash from '@/components/dash/StudentDash';
import TeacherDash from '@/components/dash/TeacherDash';
import AdminConsole from '@/components/admin/AdminConsole';

export default function AppHome() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') return <AdminConsole />;
  return user.role === 'teacher' ? <TeacherDash /> : <StudentDash />;
}
