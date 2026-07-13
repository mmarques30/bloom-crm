import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";

export const Route = createFileRoute("/_app/calendario")({
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Calendário de conteúdo · Star CRM" },
      { name: "description", content: "Programação semanal de posts, reels e stories por cliente." },
    ],
  }),
});

const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const events: Record<number, { title: string; brand: string; tone: "primary" | "ink" | "muted" }[]> = {
  0: [{ title: "Feed · Coleção", brand: "Loja Aurora", tone: "primary" }],
  1: [
    { title: "Reels bastidor", brand: "Café Iris", tone: "muted" },
    { title: "Stories x3", brand: "Studio Nube", tone: "ink" },
  ],
  2: [{ title: "Anúncio Meta", brand: "Loja Aurora", tone: "primary" }],
  3: [{ title: "Live TikTok", brand: "Vento Sul", tone: "muted" }],
  4: [
    { title: "Carrossel", brand: "Casa Amarela", tone: "ink" },
    { title: "Post feed", brand: "Café Iris", tone: "primary" },
  ],
  5: [],
  6: [{ title: "Reels lifestyle", brand: "Vento Sul", tone: "primary" }],
};

function CalendarPage() {
  return (
    <>
      <Topbar title="Calendário" subtitle="Semana de 14 – 20 de julho." />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            {days.map((d, i) => (
              <div key={d} className="px-4 py-3 font-medium">
                {d} <span className="ml-1 text-foreground/70">{14 + i}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[420px]">
            {days.map((d, i) => (
              <div key={d} className="border-r border-border last:border-r-0 p-3 space-y-2">
                {events[i]?.map((e, j) => (
                  <div
                    key={j}
                    className={
                      "rounded-lg px-3 py-2 text-xs " +
                      (e.tone === "primary"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : e.tone === "ink"
                          ? "card-ink"
                          : "bg-secondary text-secondary-foreground")
                    }
                  >
                    <div className="font-medium">{e.title}</div>
                    <div className={e.tone === "ink" ? "text-white/60" : "text-muted-foreground"}>{e.brand}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
