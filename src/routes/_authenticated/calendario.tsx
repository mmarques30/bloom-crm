import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { ensurePermission } from "@/lib/permission-guard";
import { useCrmDialogs } from "@/components/crm-dialogs";
import { isoDate, useConteudos, type Conteudo } from "@/hooks/use-crm";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/calendario")({
  beforeLoad: async () => {
    if (!(await ensurePermission("screen.calendario"))) throw redirect({ to: "/sem-acesso" });
  },
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Calendário de conteúdo · Star CRM" },
      {
        name: "description",
        content: "Programação semanal de posts, reels e stories por cliente.",
      },
    ],
  }),
});

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function inicioDaSemana(offset: number) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dow = (hoje.getDay() + 6) % 7; // segunda = 0
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - dow + offset * 7);
  return inicio;
}

function addDias(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toneClass(c: Conteudo) {
  if (c.status === "Aprovado" || c.status === "Publicado")
    return "bg-primary/10 text-primary border border-primary/20";
  if (c.status === "Aguardando") return "card-ink";
  return "bg-secondary text-secondary-foreground";
}

function CalendarPage() {
  const dialogs = useCrmDialogs();
  const [offset, setOffset] = useState(0);
  const inicio = inicioDaSemana(offset);
  const fim = addDias(inicio, 6);
  const { data: conteudos = [], isLoading } = useConteudos(isoDate(inicio), isoDate(fim));

  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  const hojeIso = isoDate(new Date());

  return (
    <>
      <Topbar title="Calendário" subtitle={`Semana de ${fmt(inicio)} – ${fmt(fim)}.`} />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="pill gap-1 border-border bg-card"
              onClick={() => setOffset(offset - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="pill border-border bg-card"
              onClick={() => setOffset(0)}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="pill gap-1 border-border bg-card"
              onClick={() => setOffset(offset + 1)}
            >
              Próxima <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Carregando…"
              : `${conteudos.length} conteúdo(s) nesta semana · clique num card para editar`}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            {dias.map((d, i) => {
              const dia = addDias(inicio, i);
              const isHoje = isoDate(dia) === hojeIso;
              return (
                <div key={d} className="px-4 py-3 font-medium">
                  {d}{" "}
                  <span
                    className={
                      "ml-1 " + (isHoje ? "text-primary font-semibold" : "text-foreground/70")
                    }
                  >
                    {dia.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 min-h-[420px]">
            {dias.map((d, i) => {
              const dia = addDias(inicio, i);
              const diaIso = isoDate(dia);
              const eventos = conteudos.filter((c) => c.agendado_para === diaIso);
              return (
                <div
                  key={d}
                  className="group border-r border-border last:border-r-0 p-3 flex flex-col gap-2"
                >
                  {eventos.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => dialogs.openConteudo(e)}
                      className={
                        "rounded-lg px-3 py-2 text-left text-xs transition-transform hover:-translate-y-0.5 " +
                        toneClass(e)
                      }
                    >
                      <div className="font-medium">
                        {e.hora.slice(0, 5)} · {e.tipo}
                      </div>
                      <div
                        className={
                          e.status === "Aguardando" ? "text-white/60" : "text-muted-foreground"
                        }
                      >
                        {e.titulo}
                      </div>
                      <div
                        className={
                          e.status === "Aguardando" ? "text-white/60" : "text-muted-foreground"
                        }
                      >
                        {e.clientes?.nome ?? "—"} · {e.status}
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => dialogs.openConteudo(undefined, diaIso)}
                    className="mt-auto flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-1.5 text-xs text-muted-foreground opacity-0 transition-opacity hover:border-primary/50 hover:text-primary group-hover:opacity-100"
                  >
                    <Plus className="h-3 w-3" /> conteúdo
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
