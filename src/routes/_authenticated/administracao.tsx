import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Shield, ShieldCheck, User as UserIcon, Search } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import {
  listUsers,
  listAllPermissions,
  getUserPermissions,
  setUserPermission,
  setUserRole,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/administracao")({
  beforeLoad: async ({ context }) => {
    // Bloqueia render server-side; a checagem real acontece no cliente também.
    if (!context) throw redirect({ to: "/sem-acesso" });
  },
  component: AdminPage,
  head: () => ({ meta: [{ title: "Administração · Star CRM" }] }),
});

function AdminPage() {
  const { data: perms, isLoading: permsLoading } = usePermissions();

  if (permsLoading) {
    return (
      <div className="p-10 text-sm text-muted-foreground">Carregando…</div>
    );
  }

  if (!perms?.isAdmin) {
    return (
      <div className="p-10">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl">Área restrita</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Somente administradores podem gerenciar acessos.
          </p>
        </div>
      </div>
    );
  }

  return <AdminInner />;
}

function AdminInner() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listUsers);
  const fetchAllPerms = useServerFn(listAllPermissions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const usersQ = useQuery({ queryKey: ["admin", "users"], queryFn: () => fetchUsers() });
  const permsQ = useQuery({ queryKey: ["admin", "permissions"], queryFn: () => fetchAllPerms() });

  const users = usersQ.data ?? [];
  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      !q ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q)
    );
  });

  const selected = users.find((u) => u.id === selectedId) ?? null;

  return (
    <>
      <Topbar title="Administração" subtitle="Gerencie usuários e libere acesso por tela, menu e aba." />

      <div className="grid gap-5 p-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar usuário…"
                className="pill h-10 border-border bg-background pl-10"
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{users.length} usuários</div>
          </div>
          <ul className="max-h-[65vh] overflow-y-auto divide-y divide-border">
            {filtered.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => setSelectedId(u.id)}
                  className={
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors " +
                    (selectedId === u.id ? "bg-secondary" : "hover:bg-secondary/50")
                  }
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                    {(u.full_name ?? u.email ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{u.full_name ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  {u.is_admin && (
                    <span className="pill inline-flex items-center gap-1 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <ShieldCheck className="h-3 w-3" /> admin
                    </span>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">Nenhum usuário encontrado.</li>
            )}
          </ul>
        </aside>

        <section className="rounded-2xl border border-border bg-card">
          {selected ? (
            <UserDetail
              key={selected.id}
              user={selected}
              allPermissions={permsQ.data ?? []}
              onRoleChange={() => qc.invalidateQueries({ queryKey: ["admin", "users"] })}
            />
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-xl">Selecione um usuário</div>
                <p className="text-sm text-muted-foreground">
                  Escolha alguém à esquerda para gerenciar acessos.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

type UserRow = Awaited<ReturnType<typeof listUsers>>[number];
type PermRow = Awaited<ReturnType<typeof listAllPermissions>>[number];

function UserDetail({
  user,
  allPermissions,
  onRoleChange,
}: {
  user: UserRow;
  allPermissions: PermRow[];
  onRoleChange: () => void;
}) {
  const qc = useQueryClient();
  const fetchUserPerms = useServerFn(getUserPermissions);
  const togglePerm = useServerFn(setUserPermission);
  const toggleRole = useServerFn(setUserRole);

  const permQ = useQuery({
    queryKey: ["admin", "user-perms", user.id],
    queryFn: () => fetchUserPerms({ data: { userId: user.id } }),
  });

  const permMutation = useMutation({
    mutationFn: (v: { permissionKey: string; enabled: boolean }) =>
      togglePerm({ data: { userId: user.id, ...v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user-perms", user.id] });
      qc.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar."),
  });

  const roleMutation = useMutation({
    mutationFn: (makeAdmin: boolean) => toggleRole({ data: { userId: user.id, makeAdmin } }),
    onSuccess: () => {
      toast.success("Papel atualizado.");
      onRoleChange();
      qc.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao atualizar papel."),
  });

  const active = new Set(permQ.data ?? []);
  const menus = allPermissions.filter((p) => p.category === "menu");

  return (
    <div className="flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
            {(user.full_name ?? user.email ?? "?").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-display text-xl leading-none">{user.full_name ?? "—"}</div>
            <div className="mt-1 text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2">
          <div className="text-sm">
            <div className="font-medium">Administrador</div>
            <div className="text-xs text-muted-foreground">Acesso total ao sistema</div>
          </div>
          <Switch
            checked={user.is_admin}
            onCheckedChange={(v) => roleMutation.mutate(v)}
            disabled={roleMutation.isPending}
          />
        </div>
      </header>

      <div className="p-6 space-y-6">
        {user.is_admin && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
            Este usuário é administrador e já possui acesso total. As liberações abaixo se aplicam quando ele deixar de ser admin.
          </div>
        )}

        {permQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando permissões…</div>
        ) : (
          menus.map((menu) => {
            const screens = allPermissions.filter((p) => p.category === "screen" && p.parent_key === menu.key);
            return (
              <div key={menu.key} className="rounded-2xl border border-border bg-background">
                <PermRow
                  label={menu.label}
                  hint="Menu na barra lateral"
                  checked={active.has(menu.key)}
                  pending={permMutation.isPending}
                  onToggle={(v) => permMutation.mutate({ permissionKey: menu.key, enabled: v })}
                  variant="menu"
                />
                {screens.map((scr) => {
                  const tabs = allPermissions.filter((p) => p.category === "tab" && p.parent_key === scr.key);
                  return (
                    <div key={scr.key} className="border-t border-border">
                      <PermRow
                        label={scr.label}
                        hint="Tela"
                        checked={active.has(scr.key)}
                        pending={permMutation.isPending}
                        onToggle={(v) => permMutation.mutate({ permissionKey: scr.key, enabled: v })}
                        variant="screen"
                      />
                      {tabs.length > 0 && (
                        <div className="border-t border-border bg-muted/30">
                          {tabs.map((tab) => (
                            <PermRow
                              key={tab.key}
                              label={tab.label}
                              hint="Aba"
                              checked={active.has(tab.key)}
                              pending={permMutation.isPending}
                              onToggle={(v) => permMutation.mutate({ permissionKey: tab.key, enabled: v })}
                              variant="tab"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PermRow({
  label,
  hint,
  checked,
  pending,
  onToggle,
  variant,
}: {
  label: string;
  hint: string;
  checked: boolean;
  pending: boolean;
  onToggle: (v: boolean) => void;
  variant: "menu" | "screen" | "tab";
}) {
  const pad =
    variant === "menu" ? "px-5 py-4" : variant === "screen" ? "px-8 py-3" : "px-12 py-2.5";
  return (
    <div className={"flex items-center justify-between gap-4 " + pad}>
      <div className="min-w-0">
        <div className={variant === "menu" ? "text-sm font-semibold" : "text-sm"}>{label}</div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} disabled={pending} />
    </div>
  );
}

// keep Button import in case of future use
void Button;
