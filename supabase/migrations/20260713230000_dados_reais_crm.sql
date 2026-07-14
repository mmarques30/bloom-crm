-- =====================================================
-- Star CRM · Dados reais — clientes, conteúdos, campanhas, preferências
-- Complementa o schema de auth/permissões já existente.
-- =====================================================

-- Campos extras no perfil (tela Configurações)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cargo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS telefone text NOT NULL DEFAULT '';

-- ---------- PREFERENCIAS ----------
CREATE TABLE public.preferencias (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  aprovacoes boolean NOT NULL DEFAULT true,
  resumo_diario boolean NOT NULL DEFAULT true,
  alerta_campanha boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.preferencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preferencias: apenas o dono"
  ON public.preferencias FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- CLIENTES ----------
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  segmento text NOT NULL DEFAULT '',
  plano text NOT NULL DEFAULT 'Starter' CHECK (plano IN ('Starter','Growth','Scale')),
  canais text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','arquivado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes: workspace autenticado"
  ON public.clientes FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ---------- CONTEUDOS ----------
CREATE TABLE public.conteudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  tipo text NOT NULL DEFAULT 'Post feed'
    CHECK (tipo IN ('Post feed','Reels','Stories','Carrossel','Anúncio Meta','Live')),
  agendado_para date NOT NULL,
  hora text NOT NULL DEFAULT '10:00',
  status text NOT NULL DEFAULT 'Rascunho'
    CHECK (status IN ('Rascunho','Em revisão','Aguardando','Aprovado','Publicado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX conteudos_agendado_idx ON public.conteudos (agendado_para);
CREATE INDEX conteudos_cliente_idx ON public.conteudos (cliente_id);

ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conteudos: workspace autenticado"
  ON public.conteudos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ---------- CAMPANHAS ----------
CREATE TABLE public.campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  status text NOT NULL DEFAULT 'Rascunho' CHECK (status IN ('Rascunho','Ativa','Encerrada')),
  orcamento_centavos bigint NOT NULL DEFAULT 0,
  consumido_centavos bigint NOT NULL DEFAULT 0,
  termina_em date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campanhas_cliente_idx ON public.campanhas (cliente_id);

ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campanhas: workspace autenticado"
  ON public.campanhas FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ---------- updated_at automático (reusa a função existente) ----------
CREATE TRIGGER preferencias_updated_at BEFORE UPDATE ON public.preferencias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER clientes_updated_at BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER conteudos_updated_at BEFORE UPDATE ON public.conteudos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER campanhas_updated_at BEFORE UPDATE ON public.campanhas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
