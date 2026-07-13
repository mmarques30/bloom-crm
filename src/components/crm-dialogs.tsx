import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CANAIS,
  PLANOS,
  STATUS_CONTEUDO,
  TIPOS_CONTEUDO,
  isoDate,
  useArquivarCliente,
  useClientes,
  useDeleteCampanha,
  useDeleteConteudo,
  useSaveCampanha,
  useSaveCliente,
  useSaveConteudo,
  type Campanha,
  type Cliente,
  type Conteudo,
} from "@/hooks/use-crm";

/* =====================================================
   Contexto global de diálogos do CRM
   (Topbar, Dashboard e páginas abrem os mesmos modais)
===================================================== */
type DialogsApi = {
  openCliente: (c?: Cliente) => void;
  openConteudo: (c?: Conteudo, dataDefault?: string) => void;
  openCampanha: (c?: Campanha) => void;
};

const Ctx = createContext<DialogsApi | null>(null);

export function useCrmDialogs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCrmDialogs precisa do CrmDialogsProvider");
  return ctx;
}

export function CrmDialogsProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<{ open: boolean; item?: Cliente }>({ open: false });
  const [conteudo, setConteudo] = useState<{
    open: boolean;
    item?: Conteudo;
    dataDefault?: string;
  }>({ open: false });
  const [campanha, setCampanha] = useState<{ open: boolean; item?: Campanha }>({ open: false });

  const api: DialogsApi = {
    openCliente: (item) => setCliente({ open: true, item }),
    openConteudo: (item, dataDefault) => setConteudo({ open: true, item, dataDefault }),
    openCampanha: (item) => setCampanha({ open: true, item }),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <ClienteDialog state={cliente} onClose={() => setCliente({ open: false })} />
      <ConteudoDialog state={conteudo} onClose={() => setConteudo({ open: false })} />
      <CampanhaDialog state={campanha} onClose={() => setCampanha({ open: false })} />
    </Ctx.Provider>
  );
}

/* ---------------- Cliente ---------------- */
function ClienteDialog({
  state,
  onClose,
}: {
  state: { open: boolean; item?: Cliente };
  onClose: () => void;
}) {
  const save = useSaveCliente();
  const arquivar = useArquivarCliente();
  const [nome, setNome] = useState("");
  const [segmento, setSegmento] = useState("");
  const [plano, setPlano] = useState<string>("Starter");
  const [canais, setCanais] = useState<string[]>(["Instagram"]);

  useEffect(() => {
    if (state.open) {
      setNome(state.item?.nome ?? "");
      setSegmento(state.item?.segmento ?? "");
      setPlano(state.item?.plano ?? "Starter");
      setCanais(state.item?.canais ?? ["Instagram"]);
    }
  }, [state.open, state.item]);

  function submit() {
    if (!nome.trim()) {
      toast.error("Informe o nome da marca.");
      return;
    }
    save.mutate(
      { id: state.item?.id, nome: nome.trim(), segmento: segmento.trim(), plano, canais },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">
            {state.item ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
          <DialogDescription>
            {state.item
              ? "Alterações são salvas na carteira."
              : "Cadastre uma nova marca na sua carteira."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nome da marca</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Loja Aurora"
              className="h-10 bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Segmento</Label>
              <Input
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                placeholder="Ex.: Moda"
                className="h-10 bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Plano</Label>
              <Select value={plano} onValueChange={setPlano}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANOS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Canais</Label>
            <div className="flex flex-wrap gap-2">
              {CANAIS.map((c) => {
                const on = canais.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCanais(on ? canais.filter((x) => x !== c) : [...canais, c])}
                    className={
                      "pill border px-3 py-1.5 text-xs font-medium transition-colors " +
                      (on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40")
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center gap-2 sm:justify-between">
          {state.item ? (
            <Button
              type="button"
              variant="ghost"
              className="pill text-destructive hover:text-destructive"
              disabled={arquivar.isPending}
              onClick={() => arquivar.mutate(state.item!.id, { onSuccess: onClose })}
            >
              Arquivar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="pill" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" className="pill" disabled={save.isPending} onClick={submit}>
              {state.item ? "Salvar" : "Criar cliente"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Conteúdo ---------------- */
function ConteudoDialog({
  state,
  onClose,
}: {
  state: { open: boolean; item?: Conteudo; dataDefault?: string };
  onClose: () => void;
}) {
  const { data: clientes = [] } = useClientes();
  const save = useSaveConteudo();
  const del = useDeleteConteudo();
  const [titulo, setTitulo] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState<string>("Post feed");
  const [data, setData] = useState(isoDate(new Date()));
  const [hora, setHora] = useState("10:00");
  const [status, setStatus] = useState<string>("Rascunho");

  useEffect(() => {
    if (state.open) {
      setTitulo(state.item?.titulo ?? "");
      setClienteId(state.item?.cliente_id ?? clientes[0]?.id ?? "");
      setTipo(state.item?.tipo ?? "Post feed");
      setData(state.item?.agendado_para ?? state.dataDefault ?? isoDate(new Date()));
      setHora(state.item?.hora ?? "10:00");
      setStatus(state.item?.status ?? "Rascunho");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.item, state.dataDefault]);

  function submit() {
    if (!titulo.trim()) {
      toast.error("Dê um título ao conteúdo.");
      return;
    }
    if (!clienteId) {
      toast.error("Cadastre um cliente primeiro.");
      return;
    }
    save.mutate(
      {
        id: state.item?.id,
        titulo: titulo.trim(),
        cliente_id: clienteId,
        tipo,
        agendado_para: data,
        hora,
        status,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">
            {state.item ? "Editar conteúdo" : "Novo conteúdo"}
          </DialogTitle>
          <DialogDescription>Aparece na agenda do Dashboard e no Calendário.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Reels bastidores"
              className="h-10 bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CONTEUDO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-10 bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Hora</Label>
              <Input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="h-10 bg-background"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_CONTEUDO.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center gap-2 sm:justify-between">
          {state.item ? (
            <Button
              type="button"
              variant="ghost"
              className="pill text-destructive hover:text-destructive"
              disabled={del.isPending}
              onClick={() => del.mutate(state.item!.id, { onSuccess: onClose })}
            >
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="pill" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" className="pill" disabled={save.isPending} onClick={submit}>
              {state.item ? "Salvar" : "Agendar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Campanha ---------------- */
function CampanhaDialog({
  state,
  onClose,
}: {
  state: { open: boolean; item?: Campanha };
  onClose: () => void;
}) {
  const { data: clientes = [] } = useClientes();
  const save = useSaveCampanha();
  const del = useDeleteCampanha();
  const [nome, setNome] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [status, setStatus] = useState<string>("Rascunho");
  const [orcamento, setOrcamento] = useState("");
  const [consumido, setConsumido] = useState("0");
  const [termina, setTermina] = useState("");

  useEffect(() => {
    if (state.open) {
      setNome(state.item?.nome ?? "");
      setClienteId(state.item?.cliente_id ?? clientes[0]?.id ?? "");
      setStatus(state.item?.status ?? "Rascunho");
      setOrcamento(state.item ? String(state.item.orcamento_centavos / 100) : "");
      setConsumido(state.item ? String(state.item.consumido_centavos / 100) : "0");
      setTermina(state.item?.termina_em ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.item]);

  function submit() {
    if (!nome.trim()) {
      toast.error("Dê um nome à campanha.");
      return;
    }
    if (!clienteId) {
      toast.error("Cadastre um cliente primeiro.");
      return;
    }
    save.mutate(
      {
        id: state.item?.id,
        nome: nome.trim(),
        cliente_id: clienteId,
        status,
        orcamento_centavos: Math.round((parseFloat(orcamento) || 0) * 100),
        consumido_centavos: Math.round((parseFloat(consumido) || 0) * 100),
        termina_em: termina || null,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">
            {state.item ? "Editar campanha" : "Nova campanha"}
          </DialogTitle>
          <DialogDescription>Campanha de mídia paga vinculada a um cliente.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nome da campanha</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Coleção Inverno"
              className="h-10 bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Rascunho", "Ativa", "Encerrada"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Orçamento (R$)</Label>
              <Input
                type="number"
                min="0"
                value={orcamento}
                onChange={(e) => setOrcamento(e.target.value)}
                placeholder="12000"
                className="h-10 bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Consumido (R$)</Label>
              <Input
                type="number"
                min="0"
                value={consumido}
                onChange={(e) => setConsumido(e.target.value)}
                className="h-10 bg-background"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Encerra em</Label>
            <Input
              type="date"
              value={termina}
              onChange={(e) => setTermina(e.target.value)}
              className="h-10 bg-background"
            />
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center gap-2 sm:justify-between">
          {state.item ? (
            <Button
              type="button"
              variant="ghost"
              className="pill text-destructive hover:text-destructive"
              disabled={del.isPending}
              onClick={() => del.mutate(state.item!.id, { onSuccess: onClose })}
            >
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="pill" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" className="pill" disabled={save.isPending} onClick={submit}>
              {state.item ? "Salvar" : "Criar campanha"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
