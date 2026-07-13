import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Cliente = Tables<"clientes">;
export type Conteudo = Tables<"conteudos"> & { clientes: { nome: string } | null };
export type Campanha = Tables<"campanhas"> & { clientes: { nome: string } | null };
export type Profile = Tables<"profiles">;
export type Preferencias = Tables<"preferencias">;

export const STATUS_CONTEUDO = [
  "Rascunho",
  "Em revisão",
  "Aguardando",
  "Aprovado",
  "Publicado",
] as const;
export const TIPOS_CONTEUDO = [
  "Post feed",
  "Reels",
  "Stories",
  "Carrossel",
  "Anúncio Meta",
  "Live",
] as const;
export const PLANOS = ["Starter", "Growth", "Scale"] as const;
export const CANAIS = ["Instagram", "TikTok", "YouTube", "LinkedIn"] as const;

export function isoDate(d: Date) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
export function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
export function fmtDia(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

function onErr(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  toast.error(
    msg.includes("relation") || msg.includes("does not exist")
      ? "Banco ainda não migrado — aplique a migração star_crm_v1 no Supabase."
      : msg,
  );
}

/* ---------------- Perfil ---------------- */
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: TablesUpdate<"profiles">) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: auth.user.id, ...patch }, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil salvo");
    },
    onError: onErr,
  });
}

/* ---------------- Preferências ---------------- */
export function usePrefs() {
  return useQuery({
    queryKey: ["prefs"],
    queryFn: async (): Promise<Preferencias | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("preferencias")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdatePrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<TablesInsert<"preferencias">>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada");
      const { error } = await supabase
        .from("preferencias")
        .upsert({ user_id: auth.user.id, ...patch }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prefs"] });
      toast.success("Preferência salva");
    },
    onError: onErr,
  });
}

/* ---------------- Clientes ---------------- */
export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async (): Promise<Cliente[]> => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("status", "ativo")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: TablesInsert<"clientes"> & { id?: string }) => {
      if (c.id) {
        const { id, ...patch } = c;
        const { error } = await supabase.from("clientes").update(patch).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clientes").insert(c);
        if (error) throw error;
      }
    },
    onSuccess: (_d, c) => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(c.id ? `Cliente "${c.nome}" atualizado` : `Cliente "${c.nome}" criado`);
    },
    onError: onErr,
  });
}

export function useArquivarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clientes")
        .update({ status: "arquivado" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente arquivado (histórico preservado)");
    },
    onError: onErr,
  });
}

/* ---------------- Conteúdos ---------------- */
export function useConteudos(deIso?: string, ateIso?: string) {
  return useQuery({
    queryKey: ["conteudos", deIso ?? "all", ateIso ?? "all"],
    queryFn: async (): Promise<Conteudo[]> => {
      let q = supabase
        .from("conteudos")
        .select("*, clientes(nome)")
        .order("agendado_para")
        .order("hora");
      if (deIso) q = q.gte("agendado_para", deIso);
      if (ateIso) q = q.lte("agendado_para", ateIso);
      const { data, error } = await q;
      if (error) throw error;
      return data as Conteudo[];
    },
  });
}

export function useSaveConteudo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: TablesInsert<"conteudos"> & { id?: string }) => {
      if (c.id) {
        const { id, ...patch } = c;
        const { error } = await supabase.from("conteudos").update(patch).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("conteudos").insert(c);
        if (error) throw error;
      }
    },
    onSuccess: (_d, c) => {
      qc.invalidateQueries({ queryKey: ["conteudos"] });
      toast.success(c.id ? "Conteúdo atualizado" : `"${c.titulo}" agendado`);
    },
    onError: onErr,
  });
}

export function useAvancarStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: { id: string; status: string }) => {
      const i = STATUS_CONTEUDO.indexOf(c.status as (typeof STATUS_CONTEUDO)[number]);
      const prox = STATUS_CONTEUDO[Math.min(i + 1, STATUS_CONTEUDO.length - 1)];
      const { error } = await supabase.from("conteudos").update({ status: prox }).eq("id", c.id);
      if (error) throw error;
      return prox;
    },
    onSuccess: (prox) => {
      qc.invalidateQueries({ queryKey: ["conteudos"] });
      toast.success(`Status → ${prox}`);
    },
    onError: onErr,
  });
}

export function useDeleteConteudo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conteudos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conteudos"] });
      toast.success("Conteúdo excluído");
    },
    onError: onErr,
  });
}

/* ---------------- Campanhas ---------------- */
export function useCampanhas() {
  return useQuery({
    queryKey: ["campanhas"],
    queryFn: async (): Promise<Campanha[]> => {
      const { data, error } = await supabase
        .from("campanhas")
        .select("*, clientes(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campanha[];
    },
  });
}

export function useSaveCampanha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: TablesInsert<"campanhas"> & { id?: string }) => {
      if (c.id) {
        const { id, ...patch } = c;
        const { error } = await supabase.from("campanhas").update(patch).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("campanhas").insert(c);
        if (error) throw error;
      }
    },
    onSuccess: (_d, c) => {
      qc.invalidateQueries({ queryKey: ["campanhas"] });
      toast.success(c.id ? "Campanha atualizada" : `Campanha "${c.nome}" criada`);
    },
    onError: onErr,
  });
}

export function useDeleteCampanha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campanhas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campanhas"] });
      toast.success("Campanha excluída");
    },
    onError: onErr,
  });
}
