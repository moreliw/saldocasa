export function LandingTrust() {
  return (
    <section id="por-que" className="border-y border-slate-200/70 bg-white py-16">
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Por que existe
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Finança em casa
              <br />
              <span className="font-serif italic font-normal text-slate-700">
                não cabe numa planilha.
              </span>
            </h2>
          </div>

          <div className="space-y-5 text-[1.02rem] leading-relaxed text-slate-700">
            <p>
              Quase ninguém abre a planilha no domingo à noite. O app do banco mostra extrato,
              mas não junta o cartão do casal nem agrupa por categoria. O caderno some.
              No fim do mês, falta dinheiro e ninguém sabe explicar por quê.
            </p>
            <p>
              O saldocasa foi construído para o caso real: <strong className="font-medium">duas
              pessoas, vidas misturadas, despesas espalhadas em cinco lugares.</strong> Uma tela,
              um modelo mental, trinta segundos por dia.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-100 pt-8 sm:grid-cols-3">
              <Stat number="30s" label="por lançamento" />
              <Stat number="1×" label="ambiente isolado por família" />
              <Stat number="0" label="dependência de planilha" />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-3xl font-semibold tabular-nums tracking-tight text-slate-950">
        {number}
      </dt>
      <dd className="mt-1 text-xs text-slate-500">{label}</dd>
    </div>
  );
}
