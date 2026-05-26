async function getApiHealth() {
  try {
    const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3011/api';
    const res = await fetch(`${url}/health`, { cache: 'no-store' });
    if (!res.ok) return { status: 'down' as const };
    return (await res.json()) as { status: string; db: string };
  } catch {
    return { status: 'down' as const, db: 'unknown' };
  }
}

export default async function Page() {
  const health = await getApiHealth();
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">saldocasa</h1>
      <p className="mt-2 text-slate-600">Controle financeiro doméstico — em construção.</p>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Status</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">API</dt>
            <dd className="font-medium">{health.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Banco</dt>
            <dd className="font-medium">{('db' in health && health.db) || 'unknown'}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
