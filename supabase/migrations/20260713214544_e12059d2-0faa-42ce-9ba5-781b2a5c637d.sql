
-- =========================
-- ENUM: papel de usuário
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =========================
-- profiles
-- =========================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================
-- user_roles
-- =========================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========================
-- has_role (security definer, evita recursão em RLS)
-- =========================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- =========================
-- permissions (catálogo)
-- =========================
CREATE TABLE public.permissions (
  key text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL CHECK (category IN ('menu','screen','tab')),
  parent_key text,
  sort_order int NOT NULL DEFAULT 0
);

GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permissions readable by authenticated"
  ON public.permissions FOR SELECT TO authenticated USING (true);

-- Catálogo inicial
INSERT INTO public.permissions (key, label, category, parent_key, sort_order) VALUES
  ('menu.dashboard',      'Dashboard',       'menu', NULL, 10),
  ('menu.clientes',       'Clientes',        'menu', NULL, 20),
  ('menu.calendario',     'Calendário',      'menu', NULL, 30),
  ('menu.campanhas',      'Campanhas',       'menu', NULL, 40),
  ('menu.analytics',      'Performance',     'menu', NULL, 50),
  ('menu.configuracoes',  'Configurações',   'menu', NULL, 60),
  ('menu.ajuda',          'Ajuda & suporte', 'menu', NULL, 70),

  ('screen.dashboard',    'Ver Dashboard',      'screen', 'menu.dashboard',     10),
  ('screen.clientes',     'Ver Clientes',       'screen', 'menu.clientes',      10),
  ('screen.calendario',   'Ver Calendário',     'screen', 'menu.calendario',    10),
  ('screen.campanhas',    'Ver Campanhas',      'screen', 'menu.campanhas',     10),
  ('screen.analytics',    'Ver Performance',    'screen', 'menu.analytics',     10),
  ('screen.configuracoes','Ver Configurações',  'screen', 'menu.configuracoes', 10),
  ('screen.ajuda',        'Ver Ajuda',          'screen', 'menu.ajuda',         10),

  ('tab.clientes.contatos',   'Aba Contatos',     'tab', 'screen.clientes', 10),
  ('tab.clientes.pipeline',   'Aba Pipeline',     'tab', 'screen.clientes', 20),
  ('tab.clientes.historico',  'Aba Histórico',    'tab', 'screen.clientes', 30),
  ('tab.campanhas.ativas',    'Aba Ativas',       'tab', 'screen.campanhas', 10),
  ('tab.campanhas.rascunhos', 'Aba Rascunhos',    'tab', 'screen.campanhas', 20),
  ('tab.campanhas.relatorios','Aba Relatórios',   'tab', 'screen.campanhas', 30);

-- =========================
-- user_permissions
-- =========================
CREATE TABLE public.user_permissions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  PRIMARY KEY (user_id, permission_key)
);

GRANT SELECT ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- =========================
-- has_permission
-- =========================
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1 FROM public.user_permissions
      WHERE user_id = _user_id AND permission_key = _key
    );
$$;

-- =========================
-- RLS policies
-- =========================

-- profiles
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_permissions
CREATE POLICY "Users read own permissions"
  ON public.user_permissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins read all permissions"
  ON public.user_permissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- (INSERT/UPDATE/DELETE em user_roles e user_permissions ficam
--  restritos ao service_role, usado via server functions autenticadas.)

-- =========================
-- Trigger: novo usuário → profile + role
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first_user boolean;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first_user;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN is_first_user THEN 'admin'::public.app_role ELSE 'user'::public.app_role END);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- updated_at trigger para profiles
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
