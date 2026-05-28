export function LandingSteps() {
  return (
    <section id="como-funciona" className="bg-slate-950 py-24 text-white">
      <div className="container">
        <div className="max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
            Como funciona
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight">
            Três passos.{' '}
            <span className="font-serif italic font-normal text-white/70">
              O resto é hábito.
            </span>
          </h2>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
          <Step
            n="01"
            title="Crie sua casa"
            body="Cadastro em 30 segundos. Já vem com categorias e formas de pagamento padrão — você ajusta depois se quiser."
          />
          <Step
            n="02"
            title="Lance o variável"
            body="O que se repete vira recorrência (salário, aluguel, assinaturas). Você só registra o que muda. Toda noite, dois minutos."
          />
          <Step
            n="03"
            title="Olhe sua evolução"
            body="No fim do mês, o gráfico de 6 meses te conta a verdade que a cabeça mente. Dá pra ajustar o orçamento da categoria que estourou."
          />
        </ol>
      </div>
    </section>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="bg-slate-950 p-8">
      <div className="font-display text-5xl font-semibold tracking-tight text-emerald-400/90">
        {n}
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{body}</p>
    </li>
  );
}
