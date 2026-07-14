import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCrmDialogs } from "@/components/crm-dialogs";
import { fmtBRL, isoDate, useCampanhas, useConteudos, useProfile } from "@/hooks/use-crm";
import { ensurePermission } from "@/lib/permission-guard";
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

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: async () => {
    if (!(await ensurePermission("screen.dashboard"))) {
      throw redirect({ to: "/sem-acesso" });
    }
  },
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard · Star CRM" },
      {
        name: "description",
        content: "Visão geral de hoje: agenda de conteúdo, aprovações e performance por canal.",
      },
    ],
  }),
});

const channels = [
  { name: "Instagram", icon: Instagram, value: "128.4k", delta: "+8.5%", up: true, progress: 72 },
  { name: "TikTok", icon: Music2, value: "94.1k", delta: "+12.2%", up: true, progress: 61 },
  { name: "YouTube", icon: Youtube, value: "22.7k", delta: "-1.3%", up: false, progress: 34 },
  { name: "LinkedIn", icon: Linkedin, value: "18.9k", delta: "+3.1%", up: true, progress: 42 },
];

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Dashboard() {
  const dialogs = useCrmDialogs();
  const { data: profile } = useProfile();
  const hoje = isoDate(new Date());
  const { data: conteudosHoje = [], isLoading } = useConteudos(hoje, hoje);
  const { data: todos = [] } = useConteudos();
  const { data: campanhas = [] } = useCampanhas();

  const pendentes = todos.filter(
    (c) => c.status === "Aguardando" || c.status === "Em revisão",
  ).length;
  const primeiroNome = (profile?.full_name || "").split(" ")[0];

  const ativas = campanhas.filter((c) => c.status === "Ativa");
  const totalOrc = ativas.reduce((a, c) => a + c.orcamento_centavos, 0);
  const totalCons = ativas.reduce((a, c) => a + c.consumido_centavos, 0);
  const pctMedia = totalOrc ? Math.min(100, Math.round((totalCons / totalOrc) * 100)) : 0;

  const quickActions = [
    { label: "Novo post", icon: ImagePlus, onClick: () => dialogs.openConteudo() },
    { label: "Novo cliente", icon: UserPlus, onClick: () => dialogs.openCliente() },
    { label: "Nova campanha", icon: Megaphone, onClick: () => dialogs.openCampanha() },
    { label: "Enviar aprovação", icon: Send, onClick: () => dialogs.openConteudo() },
  ];

  return (
    <>
      <Topbar
        title={`${saudacao()}${primeiroNome ? `, ${primeiroNome}` : ""}`}
        subtitle={`Você tem ${pendentes} aprovação(ões) pendente(s) e ${conteudosHoje.length} conteúdo(s) agendado(s) para hoje.`}
      />

      <div className="grid gap-5 p-6 xl:grid-cols-12">
        {/* Agenda */}
        <section className="xl:col-span-7 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl">Agenda de hoje</h2>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="pill text-primary hover:text-primary"
            >
              <Link to="/calendario">Ver tudo</Link>
            </Button>
          </div>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>
          ) : conteudosHoje.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhum conteúdo agendado para hoje.</p>
              <Button
                className="pill mt-4"
                size="sm"
                onClick={() => dialogs.openConteudo(undefined, hoje)}
              >
                Agendar conteúdo
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {conteudosHoje.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  <div className="w-14 text-sm font-semibold text-foreground/80">
                    {item.hora.slice(0, 5)}
                  </div>
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left"
                    onClick={() => dialogs.openConteudo(item)}
                  >
                    <div className="text-sm font-medium">{item.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.tipo} · {item.clientes?.nome ?? "—"}
                    </div>
                  </button>
                  <StatusPill status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section className="xl:col-span-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-xl">Ações rápidas</h2>
          <p className="mb-4 text-xs text-muted-foreground">Atalhos para o que você mais faz.</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
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

        {/* Mídia paga real */}
        <section className="xl:col-span-5 rounded-2xl card-ink p-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
            Mídia paga · campanhas ativas
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-display text-5xl leading-none">{fmtBRL(totalCons)}</div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
              <ArrowUpRight className="h-3 w-3" /> {pctMedia}% de {fmtBRL(totalOrc)}
            </div>
          </div>
          <p className="mt-1 text-sm text-white/60">Consumo consolidado das campanhas ativas.</p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <MiniStat label="Campanhas ativas" value={String(ativas.length)} />
            <MiniStat label="Aprovações pend." value={String(pendentes)} />
            <MiniStat label="Posts hoje" value={String(conteudosHoje.length)} />
          </div>
        </section>

        {/* Channel performance (ilustrativo até integrar redes) */}
        <section className="xl:col-span-7 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl">Performance por canal</h2>
              <p className="text-xs text-muted-foreground">
                Ilustrativo — liga nas APIs das redes na v2
              </p>
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
                    {c.up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
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
    Aprovado: {
      icon: CheckCircle2,
      cls: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    },
    Publicado: { icon: CheckCircle2, cls: "bg-[color:var(--ink)] text-white" },
    Aguardando: { icon: Clock, cls: "bg-primary/10 text-primary" },
    Rascunho: { icon: Clock, cls: "bg-muted text-muted-foreground" },
    "Em revisão": { icon: Clock, cls: "bg-secondary text-secondary-foreground" },
  };
  const item = map[status] ?? map.Rascunho;
  const Icon = item.icon;
  return (
    <span
      className={
        "pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium " + item.cls
      }
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
