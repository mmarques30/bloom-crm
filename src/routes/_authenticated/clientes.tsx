import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Instagram, Music2, Youtube, Linkedin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Can } from "@/components/can";
import { ensurePermission } from "@/lib/permission-guard";
import { useCrmDialogs } from "@/components/crm-dialogs";
import { useClientes, useConteudos } from "@/hooks/use-crm";

export const Route = createFileRoute("/_authenticated/clientes")({
  beforeLoad: async () => {
    if (!(await ensurePermission("screen.clientes"))) {
      throw redirect({ to: "/sem-acesso" });
    }
  },
  component: ClientsPage,
  head: () => ({
    meta: [
      { title: "Clientes · Star CRM" },
      {
        name: "description",
        content: "Sua carteira de marcas: contatos, contratos e performance por cliente.",
      },
    ],
  }),
});

const CanalIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram,
  TikTok: Music2,
  YouTube: Youtube,
  LinkedIn: Linkedin,
};

function ClientsPage() {
  const dialogs = useCrmDialogs();
  const { data: clientes = [], isLoading } = useClientes();
  const { data: conteudos = [] } = useConteudos();
  const [busca, setBusca] = useState("");

  const termo = busca.trim().toLowerCase();
  const lista = clientes.filter(
    (c) =>
      !termo || c.nome.toLowerCase().includes(termo) || c.segmento.toLowerCase().includes(termo),
  );

  const mesAtual = new Date().toISOString().slice(0, 7);
  const postsNoMes = (clienteId: string) =>
    conteudos.filter((c) => c.cliente_id === clienteId && c.agendado_para.startsWith(mesAtual))
      .length;

  return (
    <>
      <Topbar title="Clientes" subtitle="Sua carteira ativa de marcas e contas." />
      <div className="p-6">
        <Tabs defaultValue="contatos">
          <TabsList className="pill mb-4 bg-muted">
            <Can permission="tab.clientes.contatos">
              <TabsTrigger value="contatos" className="pill">
                Contatos
              </TabsTrigger>
            </Can>
            <Can permission="tab.clientes.pipeline">
              <TabsTrigger value="pipeline" className="pill">
                Pipeline
              </TabsTrigger>
            </Can>
            <Can permission="tab.clientes.historico">
              <TabsTrigger value="historico" className="pill">
                Histórico
              </TabsTrigger>
            </Can>
          </TabsList>

          <TabsContent value="contatos">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente…"
                  className="pill h-10 border-border bg-card pl-10"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  {lista.length} de {clientes.length} clientes ativos
                </div>
                <Button className="pill h-10 gap-1.5" onClick={() => dialogs.openCliente()}>
                  <Plus className="h-4 w-4" />
                  Novo cliente
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Segmento</th>
                    <th className="px-5 py-3">Plano</th>
                    <th className="px-5 py-3">Posts / mês</th>
                    <th className="px-5 py-3">Canais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                        Carregando…
                      </td>
                    </tr>
                  ) : lista.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                        {termo ? (
                          <>Nenhum cliente encontrado para “{busca}”.</>
                        ) : (
                          <>
                            Nenhum cliente ainda.
                            <div className="mt-4">
                              <Button
                                className="pill"
                                size="sm"
                                onClick={() => dialogs.openCliente()}
                              >
                                Cadastrar o primeiro cliente
                              </Button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    lista.map((c) => (
                      <tr
                        key={c.id}
                        className="cursor-pointer hover:bg-secondary/40 transition-colors"
                        onClick={() => dialogs.openCliente(c)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                              {c.nome
                                .split(" ")
                                .filter(Boolean)
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="font-medium">{c.nome}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{c.segmento || "—"}</td>
                        <td className="px-5 py-4">
                          <span className="pill inline-flex bg-secondary px-2.5 py-1 text-xs font-medium">
                            {c.plano}
                          </span>
                        </td>
                        <td className="px-5 py-4">{postsNoMes(c.id)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {c.canais.map((canal) => {
                              const Icon = CanalIcon[canal];
                              return Icon ? <Icon key={canal} className="h-4 w-4" /> : null;
                            })}
                            {c.canais.length === 0 && <span className="text-xs">—</span>}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Clique em uma linha para editar ou arquivar o cliente.
            </p>
          </TabsContent>

          <TabsContent value="pipeline">
            <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
              Pipeline de oportunidades por estágio (em breve).
            </div>
          </TabsContent>

          <TabsContent value="historico">
            <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
              Histórico completo de interações por cliente (em breve).
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
