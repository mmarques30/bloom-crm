import { createFileRoute, redirect } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ensurePermission } from "@/lib/permission-guard";
import { useCrmDialogs } from "@/components/crm-dialogs";
import { fmtBRL, fmtDia, useCampanhas, usePrefs } from "@/hooks/use-crm";
import { BellRing, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/campanhas")({
  beforeLoad: async () => {
    if (!(await ensurePermission("screen.campanhas"))) throw redirect({ to: "/sem-acesso" });
  },
  component: CampaignsPage,
  head: () => ({
    meta: [
      { title: "Campanhas · Star CRM" },
      {
        name: "description",
        content: "Campanhas ativas por cliente, orçamento consumido e status.",
      },
    ],
  }),
});

function CampaignsPage() {
  const dialogs = useCrmDialogs();
  const { data: campanhas = [], isLoading } = useCampanhas();
  const { data: prefs } = usePrefs();
  const alertaLigado = prefs?.alerta_campanha ?? true;

  return (
    <>
      <Topbar
        title="Campanhas"
        subtitle="Acompanhe o orçamento e o status de cada campanha ativa."
      />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Carregando…"
              : `${campanhas.length} campanha(s) · clique num card para editar`}
          </p>
          <Button className="pill h-10 gap-1.5" onClick={() => dialogs.openCampanha()}>
            <Plus className="h-4 w-4" />
            Nova campanha
          </Button>
        </div>

        {!isLoading && campanhas.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma campanha ainda.</p>
            <Button className="pill mt-4" onClick={() => dialogs.openCampanha()}>
              Criar a primeira campanha
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {campanhas.map((c) => {
              const pct = c.orcamento_centavos
                ? Math.min(100, Math.round((c.consumido_centavos / c.orcamento_centavos) * 100))
                : 0;
              const alerta = alertaLigado && c.status === "Ativa" && pct >= 80;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => dialogs.openCampanha(c)}
                  className={
                    "rounded-2xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm " +
                    (alerta ? "border-primary/50" : "border-border")
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">{c.clientes?.nome ?? "—"}</div>
                      <h3 className="font-display text-xl">{c.nome}</h3>
                    </div>
                    <span
                      className={
                        "pill inline-flex px-3 py-1 text-xs font-medium " +
                        (c.status === "Ativa"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground")
                      }
                    >
                      {c.status}
                    </span>
                  </div>

                  {alerta && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <BellRing className="h-3 w-3" /> {pct}% do orçamento consumido
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                    <Cell label="Orçamento" value={fmtBRL(c.orcamento_centavos)} />
                    <Cell label="Consumido" value={`${pct}%`} />
                    <Cell label="Encerra em" value={fmtDia(c.termina_em)} />
                  </div>

                  <div className="mt-4">
                    <Progress value={pct} className="h-1.5 bg-muted" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
