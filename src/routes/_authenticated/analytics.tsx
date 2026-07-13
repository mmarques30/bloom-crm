import { createFileRoute, redirect } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { ArrowUpRight } from "lucide-react";
import { ensurePermission } from "@/lib/permission-guard";

export const Route = createFileRoute("/_authenticated/analytics")({
  beforeLoad: async () => {
    if (!(await ensurePermission("screen.analytics"))) throw redirect({ to: "/sem-acesso" });
  },
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Performance · Star CRM" },
      { name: "description", content: "Análise consolidada de alcance, engajamento e conversões por cliente." },
    ],
  }),
});

const bars = [42, 55, 48, 62, 71, 66, 78, 84, 72, 90, 82, 96];
const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function AnalyticsPage() {
  const max = Math.max(...bars);
  return (
    <>
      <Topbar title="Performance" subtitle="Receita e alcance consolidados do ano." />
      <div className="grid gap-5 p-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl">Receita mensal</h2>
              <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
              <ArrowUpRight className="h-3 w-3" /> +14.6% vs ano anterior
            </div>
          </div>

          <div className="mt-8 flex h-56 items-end gap-3">
            {bars.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={
                    "w-full rounded-t-md transition-all " +
                    (i === bars.length - 1 ? "bg-primary" : "bg-jet/80 hover:bg-jet")
                  }
                  style={{ height: `${(v / max) * 100}%` }}
                />
                <div className="text-[10px] text-muted-foreground">{months[i]}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl card-ink p-6 flex flex-col gap-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">Receita anual</div>
            <div className="mt-2 font-display text-5xl leading-none">R$ 842k</div>
            <div className="mt-1 text-sm text-white/60">Meta: R$ 900k · 93.6%</div>
          </div>
          <div className="h-px bg-white/10" />
          <MetricRow label="Melhor mês" value="Dez · R$ 96k" />
          <MetricRow label="Média mensal" value="R$ 70.1k" />
          <MetricRow label="Ticket médio" value="R$ 3.240" />
          <MetricRow label="Taxa de retenção" value="94%" />
        </section>

        <section className="xl:col-span-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Composição de receita</h2>
          <p className="text-xs text-muted-foreground">Por linha de serviço</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Composition label="Gestão de social" value={54} color="bg-primary" />
            <Composition label="Produção de conteúdo" value={31} color="bg-jet" />
            <Composition label="Mídia paga" value={15} color="bg-platinum" />
          </div>
        </section>
      </div>
    </>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Composition({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className="font-display text-2xl">{value}%</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={"h-full " + color} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
