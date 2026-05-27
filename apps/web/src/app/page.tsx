import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function HomePage() {
  const session = await getSession();
  // Logado: vai pro dashboard. Deslogado: vai pro funil de pricing (marketing).
  redirect(session ? '/dashboard' : '/pricing');
}
