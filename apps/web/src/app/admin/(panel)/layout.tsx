import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AdminShell } from './_components/admin-shell';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  if (!session.user.isSuperAdmin) redirect('/dashboard');
  return <AdminShell session={session}>{children}</AdminShell>;
}
