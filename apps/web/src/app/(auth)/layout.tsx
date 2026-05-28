import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AuthBrandPanel } from './brand-panel';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect(session.user.isSuperAdmin ? '/admin' : '/dashboard');

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Image src="/brand/logo-full.png" alt="saldocasa" width={180} height={64} priority />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
