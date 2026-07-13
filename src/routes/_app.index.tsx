import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Instagram,
  Music2,
  Youtube,
  Linkedin,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  ImagePlus,
  UserPlus,
  Megaphone,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard · Star CRM" },
      { name: "description", content: "Visão geral de hoje: agenda de conteúdo, aprovações e performance por canal." },
    ],
  }),
});

const schedule = [
  { time: "09:00", type: "Post feed", brand: "Loja Aurora", status: "Aprovado" },
  { time: "11:30", type: "Reels", brand: "Café Iris", status: "Aguardando" },
  { time: "14:00", type: "Stories x3", brand: "Studio Nube", status: "Rascunho" },
  { time: "17:00", type: "Anúncio Meta", brand: "Loja Aurora", status: "Em revisão" },
];

const channels = [
  { name: "Instagram", icon: Instagram, value: "128.4k", delta: "+8.5%", up: true, progress: 72 },
  { name: "TikTok", icon: Music2, value: "94.1k", delta: "+12.2%", up: true, progress: 61 },
  { name: "YouTube", icon: Youtube, value: "22.7k", delta: "-1.3%", up: false, progress: 34 },
  { name: "LinkedIn", icon: Linkedin, value: "18.9k", delta: "+3.1%", up: true, progress: 42 },
];

const quickActions = [
  { label: "Novo post", icon: ImagePlus },
  { label: "Novo cliente", icon: UserPlus },
  { label: "Nova campanha", icon: Megaphone },
  { label: "Enviar aprovação", icon: Send },
];

function Dashboard() {
  return (
    <>
      <Topbar
        title="Bom dia, Ana"
        subtitle="Você tem 4 aprovações pendentes e 12 posts agendados para hoje."
      />

      <div className="grid gap-5 p-6 xl:grid-cols-12">
        {/* Agenda */}
        <section className="xl:col-span-7 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl">Agenda de hoje</h2>
              <p className="text-xs text-muted-foreground">Terça, 14 de julho</p>
            </div>
            <Button variant="ghost" size="sm" className="pill text-primary hover:text-primary">
              Ver tudo
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {schedule.map((item) => (
              <li key={item.time} className="flex items-center gap-4 py-3">
                <div className="w-14 text-sm font-semibold text-foreground/80">{item.time}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.type}</div>
                  <div className="text-xs text-muted-foreground">{item.brand}</div>
                </div>
                <StatusPill status={item.status} />
              </li>
            ))}
          </ul>
        </section>

        {/* Quick actions */}
        <section className="xl:col-span-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-xl">Ações rápidas</h2>
          <p className="mb-4 text-xs text-muted-foreground">Atalhos para o que você mais faz.</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary/40 hover:bg-secondary"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Impact block (ink) */}
        <section className="xl:col-span-5 rounded-2xl card-ink p-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">Impacto do mês</div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-display text-5xl leading-none">2.4M</div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
              <ArrowUpRight className="h-3 w-3" /> +18.2% vs mês passado
            </div>
          </div>
          <p className="mt-1 text-sm text-white/60">Alcance combinado em todos os canais.</p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <MiniStat label="Engajamento" value="6.8%" />
            <MiniStat label="Novos seguidores" value="+9.1k" />
            <MiniStat label="ROI de mídia" value="3.4x" />
          </div>
        </section>

        {/* Channel performance */}
        <section className="xl:col-span-7 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl">Performance por canal</h2>
              <p className="text-xs text-muted-foreground">Alcance nos últimos 30 dias</p>
            </div>
            <div className="inline-flex rounded-full bg-muted p-1">
              {["Semana", "Mês", "Trimestre"].map((t, i) => (
                <button
                  key={t}
                  className={
                    "px-3 py-1 text-xs rounded-full transition-colors " +
                    (i === 1
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {channels.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <c.icon className="h-4 w-4 text-primary" />
                    {c.name}
                  </div>
                  <span
                    className={
                      "inline-flex items-center gap-1 text-xs " +
                      (c.up ? "text-[color:var(--success)]" : "text-[color:var(--danger)]")
                    }
                  >
                    {c.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {c.delta}
                  </span>
                </div>
                <div className="mt-3 font-display text-2xl leading-none">{c.value}</div>
                <Progress value={c.progress} className="mt-3 h-1.5 bg-muted" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
      <div className="mt-1 font-display text-2xl leading-none">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
    Aprovado: { icon: CheckCircle2, cls: "bg-[color:var(--success)]/10 text-[color:var(--success)]" },
    Aguardando: { icon: Clock, cls: "bg-primary/10 text-primary" },
    Rascunho: { icon: Clock, cls: "bg-muted text-muted-foreground" },
    "Em revisão": { icon: Clock, cls: "bg-secondary text-secondary-foreground" },
  };
  const item = map[status] ?? map.Rascunho;
  const Icon = item.icon;
  return (
    <span className={"pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium " + item.cls}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
