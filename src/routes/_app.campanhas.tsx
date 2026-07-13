import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/campanhas")({
  component: CampaignsPage,
  head: () => ({
    meta: [
      { title: "Campanhas · Star CRM" },
      { name: "description", content: "Campanhas ativas por cliente, orçamento consumido e status." },
    ],
  }),
});

const campaigns = [
  { name: "Coleção Inverno", brand: "Loja Aurora", status: "Ativa", spent: 62, budget: "R$ 12.000", ends: "28 jul" },
  { name: "Novo cardápio", brand: "Café Iris", status: "Ativa", spent: 40, budget: "R$ 4.500", ends: "05 ago" },
  { name: "Lançamento Studio", brand: "Studio Nube", status: "Rascunho", spent: 0, budget: "R$ 8.000", ends: "—" },
  { name: "Alta temporada", brand: "Vento Sul", status: "Ativa", spent: 88, budget: "R$ 22.000", ends: "18 jul" },
];

function CampaignsPage() {
  return (
    <>
      <Topbar title="Campanhas" subtitle="Acompanhe o orçamento e o status de cada campanha ativa." />
      <div className="p-6 grid gap-4 md:grid-cols-2">
        {campaigns.map((c) => (
          <div key={c.name} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{c.brand}</div>
                <h3 className="font-display text-xl">{c.name}</h3>
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

            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <Cell label="Orçamento" value={c.budget} />
              <Cell label="Consumido" value={`${c.spent}%`} />
              <Cell label="Encerra em" value={c.ends} />
            </div>

            <div className="mt-4">
              <Progress value={c.spent} className="h-1.5 bg-muted" />
            </div>
          </div>
        ))}
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
