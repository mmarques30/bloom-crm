## Objetivo

Adicionar autenticação e um sistema de **permissões por tela / menu / aba** ao Star CRM, onde **somente administradores** conseguem acessar a área de gestão e liberar acessos por usuário.

---

## 1. Autenticação (Lovable Cloud)

- **Métodos:** Email/Senha + Google (padrão).
- **Tela de login `/auth`** inspirada no exemplo *NexusGate*, mas repaginada para o branding Star CRM:
  - Fundo: vídeo/imagem moderna com textura orgânica em tons de **Chamoisee (#987E5D) → Smoky (#181712)** (grão sutil, luz suave). Sem paleta gamer roxa.
  - Card de login com fundo claro (Platinum/branco) + acabamento em glass sutil, tipografia *Instrument Serif* no título "Star CRM" e *Inter* nos campos.
  - Botões: primário Chamoisee; Google como social único (removemos Twitter/Steam do exemplo).
  - Toggle "Lembrar-me" e link "Esqueci a senha".
  - Alternância Login ↔ Criar conta na mesma tela.
- Tabela `profiles` (id, email, full_name, avatar_url, created_at) com trigger `on_auth_user_created`.
- Layout protegido: mover todas as rotas atuais para `src/routes/_authenticated/` (gate gerenciado que redireciona para `/auth`).

## 2. Papéis (admin / user)

- Enum `app_role` = `admin | user`.
- Tabela `user_roles (user_id, role)` com RLS + função `has_role(_user_id, _role)` (security definer).
- Primeiro usuário cadastrado vira `admin` automaticamente (via trigger); demais entram como `user`.

## 3. Permissões por tela / menu / aba

Modelo simples e flexível:

- Tabela `permissions` (catálogo estático em migração) com colunas:
  - `key` (ex.: `menu.clientes`, `screen.clientes`, `tab.clientes.contatos`, `tab.clientes.pipeline`)
  - `label`, `category` (`menu` | `screen` | `tab`), `parent_key`
- Tabela `user_permissions (user_id, permission_key)` — presença = liberado.
- Função `has_permission(_user_id, _key) returns boolean` (admin sempre retorna `true`).
- RLS: usuário lê apenas as próprias permissões; admin lê/escreve tudo.

Catálogo inicial (uma linha por item):

```
menu.dashboard, menu.clientes, menu.calendario, menu.campanhas,
menu.analytics, menu.configuracoes, menu.ajuda
screen.<mesmos nomes acima>
tab.clientes.contatos, tab.clientes.pipeline, tab.clientes.historico
tab.campanhas.ativas, tab.campanhas.rascunhos, tab.campanhas.relatorios
```

## 4. Aplicação das permissões no app

- Hook `usePermissions()` — carrega `{ isAdmin, keys: Set<string> }` uma vez após login (TanStack Query).
- `AppSidebar` filtra itens de menu por `menu.<slug>`.
- Cada rota em `_authenticated/` usa `beforeLoad` para checar `screen.<slug>`; sem acesso → redireciona para `/sem-acesso`.
- Componente `<Can permission="tab.clientes.pipeline">` para esconder abas/botões dentro das telas.

## 5. Tela de Administração `/administracao/acessos` (admin-only)

- Listagem de usuários (nome, email, papel, último acesso).
- Ao selecionar um usuário: painel lateral com árvore agrupada (Menus → Telas → Abas) e switches por permissão.
- Ação: promover / rebaixar admin.
- Server functions autenticadas (`requireSupabaseAuth` + checagem `has_role('admin')`) para:
  - `listUsers`, `listUserPermissions(userId)`, `setUserPermission(userId, key, enabled)`, `setUserRole(userId, role)`.
- Novo item de menu "Administração" visível apenas para admins.

## 6. Detalhes técnicos

- Migração única com: enum, tabelas, GRANTs (`authenticated`/`service_role`), RLS, políticas, funções, catálogo de permissões, trigger de novo usuário.
- Google OAuth configurado via `supabase--configure_social_auth` no mesmo turno; `redirect_uri = window.location.origin`.
- Sign-in do Google via `lovable.auth.signInWithOAuth('google', ...)`.
- Sidebar ganha bloco "Administração" (somente admin).
- Sem quebra visual: paleta e tipografia do design system atual são mantidas; a tela de login apenas ganha o fundo/vídeo escuro cinematográfico.

---

Confirma? Se quiser, ajusto o catálogo de permissões (adicionar/remover abas) antes de eu gerar código.