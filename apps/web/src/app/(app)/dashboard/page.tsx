import { getSession } from '@/lib/session';

export default async function DashboardPage() {
  const session = (await getSession())!; // garantido pelo layout

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Olá, {session.user.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Casa: <span className="font-medium text-slate-700">{session.household.name}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Saldo do mês" value="—" />
        <SummaryCard label="Entradas" value="—" tone="positive" />
        <SummaryCard label="Saídas" value="—" tone="negative" />
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-slate-900">Próximos passos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Sua casa foi criada e as categorias e formas de pagamento padrão já estão prontas. As
          telas de lançamentos, gráficos e relatórios serão liberadas na próxima fase.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'negative';
}) {
  const toneClass =
    tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-red-600' : 'text-slate-900';
  return (
    <div className="card">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
