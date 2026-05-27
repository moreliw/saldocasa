import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="surface w-full max-w-md p-8 text-center animate-fade-in-up">
        <Image src="/brand/logo-mark.png" alt="" width={48} height={48} className="mx-auto" />
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-slate-900">
          Bem-vindo ao Pro!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sua assinatura foi ativada. Pode levar alguns segundos pra liberar todos os recursos.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/dashboard">Ir pro dashboard</Link>
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link href="/settings/billing">Ver assinatura</Link>
        </Button>
      </div>
    </div>
  );
}
