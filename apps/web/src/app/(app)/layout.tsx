import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AppShell } from './_components/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  // Super admin sem household não tem o que fazer no app — manda pro painel
  if (session.user.isSuperAdmin && !session.household) redirect('/admin');
  return <AppShell session={session}>{children}</AppShell>;
}
