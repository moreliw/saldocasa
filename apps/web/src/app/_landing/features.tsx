import { CalendarClock, PieChart, Users } from 'lucide-react';
import { FeatureVisual1, FeatureVisual2, FeatureVisual3 } from './feature-visuals';

export function LandingFeatures() {
  return (
    <section className="bg-[#f7f6f1] py-24">
      <div className="container space-y-28">
        <FeatureBlock
          eyebrow="Lançamento"
          title="Tão rápido que cabe na vinheta do café."
          body="Tipo, valor, categoria. Três campos. Recorrências cuidam do que se repete — salário, aluguel, assinaturas. Você lança o que é variável e o resto entra sozinho."
          icon={<CalendarClock className="h-4 w-4" />}
          visual={<FeatureVisual1 />}
        />

        <FeatureBlock
          eyebrow="Visualização"
          title="Os números deixam de ser abstratos."
          body="Saldo, entradas e saídas no topo. Donut por categoria revela onde o dinheiro vai. Linha de seis meses mostra se você está melhorando ou se afundando. Orçamentos por categoria com alerta antes de estourar."
          icon={<PieChart className="h-4 w-4" />}
          visual={<FeatureVisual2 />}
          reverse
        />

        <FeatureBlock
          eyebrow="Família"
          title="Mesma casa, contas separadas — e juntas."
          body="No plano Pro+ você convida o parceiro, os filhos adultos, a empregada doméstica. Cada um com login. Tudo desemboca na mesma visão de família. Nada vaza pra outras casas — isolamento total no banco."
          icon={<Users className="h-4 w-4" />}
          visual={<FeatureVisual3 />}
        />
      </div>
    </section>
  );
}

function FeatureBlock({
  eyebrow,
  title,
  body,
  icon,
  visual,
  reverse,
}: {
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white">
            {icon}
          </span>
          {eyebrow}
        </div>
        <h3 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.1] tracking-tight text-slate-950">
          {title}
        </h3>
        <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-slate-600">{body}</p>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
    </div>
  );
}
