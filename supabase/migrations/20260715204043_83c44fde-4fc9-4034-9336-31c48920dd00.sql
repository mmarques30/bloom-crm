
-- Profile extras
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cargo text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone text NOT NULL DEFAULT '';

-- Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  segmento text NOT NULL DEFAULT '',
  plano text NOT NULL DEFAULT 'Starter',
  canais text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update clientes" ON public.clientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete clientes" ON public.clientes FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_clientes_updated BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Conteúdos
CREATE TABLE IF NOT EXISTS public.conteudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  tipo text NOT NULL DEFAULT 'Post feed',
  agendado_para date NOT NULL,
  hora text NOT NULL DEFAULT '09:00',
  status text NOT NULL DEFAULT 'Rascunho',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conteudos TO authenticated;
GRANT ALL ON public.conteudos TO service_role;
ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read conteudos" ON public.conteudos FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write conteudos" ON public.conteudos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update conteudos" ON public.conteudos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete conteudos" ON public.conteudos FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_conteudos_updated BEFORE UPDATE ON public.conteudos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Campanhas
CREATE TABLE IF NOT EXISTS public.campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  status text NOT NULL DEFAULT 'ativa',
  orcamento_centavos integer NOT NULL DEFAULT 0,
  consumido_centavos integer NOT NULL DEFAULT 0,
  termina_em date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campanhas TO authenticated;
GRANT ALL ON public.campanhas TO service_role;
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read campanhas" ON public.campanhas FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write campanhas" ON public.campanhas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update campanhas" ON public.campanhas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete campanhas" ON public.campanhas FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_campanhas_updated BEFORE UPDATE ON public.campanhas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Preferências
CREATE TABLE IF NOT EXISTS public.preferencias (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  resumo_diario boolean NOT NULL DEFAULT true,
  alerta_campanha boolean NOT NULL DEFAULT true,
  aprovacoes boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.preferencias TO authenticated;
GRANT ALL ON public.preferencias TO service_role;
ALTER TABLE public.preferencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs read" ON public.preferencias FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own prefs insert" ON public.preferencias FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own prefs update" ON public.preferencias FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_prefs_updated BEFORE UPDATE ON public.preferencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
