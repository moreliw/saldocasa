import { Plus, Receipt, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDashboardSummary } from '@/lib/server-api';
import { getSession } from '@/lib/session';
import { CategoryDonut } from './_components/category-donut';
import { LatestTransactions } from './_components/latest-transactions';
import { SummaryCards } from './_components/summary-cards';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = (await getSession())!;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá, ${session.user.name.split(' ')[0]}`}
        description={`Casa ${session.household.name} — visão do mês atual.`}
        action={
          <Button asChild>
            <Link href="/transactions">
              <Plus className="h-4 w-4" />
              Novo lançamento
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const data = await fetchDashboardSummary();
  if (!data) {
    return (
      <Card>
        <EmptyState
          icon={Wallet}
          title="Não foi possível carregar"
          description="Recarregue a página em alguns instantes."
        />
      </Card>
    );
  }

  const empty = data.totals.txCount === 0;

  return (
    <div className="space-y-6">
      <SummaryCards totals={data.totals} />

      {empty ? (
        <Card>
          <EmptyState
            icon={Receipt}
            title="Comece agora"
            description="Você ainda não tem lançamentos neste mês. Adicione o primeiro para ver seus números e gráficos aqui."
            action={
              <Button asChild>
                <Link href="/transactions">
                  <Plus className="h-4 w-4" />
                  Adicionar lançamento
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Últimos lançamentos</CardTitle>
              <CardDescription>O que aconteceu por último na casa.</CardDescription>
            </CardHeader>
            <LatestTransactions items={data.latestTransactions} />
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Gastos por categoria</CardTitle>
              <CardDescription>Distribuição das saídas pagas no mês.</CardDescription>
            </CardHeader>
            <CategoryDonut data={data.byCategory} total={data.totals.expense} />
          </Card>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  );
}

