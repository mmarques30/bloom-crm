import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Input } from "@/components/ui/input";
import { Search, Instagram, Music2, Youtube } from "lucide-react";

export const Route = createFileRoute("/_app/clientes")({
  component: ClientsPage,
  head: () => ({
    meta: [
      { title: "Clientes · Star CRM" },
      { name: "description", content: "Sua carteira de marcas: contatos, contratos e performance por cliente." },
    ],
  }),
});

const clients = [
  { name: "Loja Aurora", segment: "Moda", plan: "Growth", posts: 42, engagement: "7.2%", channels: [Instagram, Music2] },
  { name: "Café Iris", segment: "F&B", plan: "Starter", posts: 18, engagement: "5.4%", channels: [Instagram] },
  { name: "Studio Nube", segment: "Arquitetura", plan: "Growth", posts: 24, engagement: "4.1%", channels: [Instagram, Youtube] },
  { name: "Vento Sul", segment: "Turismo", plan: "Scale", posts: 61, engagement: "8.9%", channels: [Instagram, Music2, Youtube] },
  { name: "Casa Amarela", segment: "Decor", plan: "Starter", posts: 12, engagement: "3.8%", channels: [Instagram] },
];

function ClientsPage() {
  return (
    <>
      <Topbar title="Clientes" subtitle="Sua carteira ativa de marcas e contas." />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar cliente…" className="pill h-10 border-border bg-card pl-10" />
          </div>
          <div className="text-sm text-muted-foreground">{clients.length} clientes ativos</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Segmento</th>
                <th className="px-5 py-3">Plano</th>
                <th className="px-5 py-3">Posts / mês</th>
                <th className="px-5 py-3">Engajamento</th>
                <th className="px-5 py-3">Canais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c) => (
                <tr key={c.name} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                        {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div className="font-medium">{c.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.segment}</td>
                  <td className="px-5 py-4">
                    <span className="pill inline-flex bg-secondary px-2.5 py-1 text-xs font-medium">{c.plan}</span>
                  </td>
                  <td className="px-5 py-4">{c.posts}</td>
                  <td className="px-5 py-4 font-medium">{c.engagement}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {c.channels.map((Icon, i) => (
                        <Icon key={i} className="h-4 w-4" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
