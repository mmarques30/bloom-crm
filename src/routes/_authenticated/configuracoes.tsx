import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Topbar } from "@/components/topbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ensurePermission } from "@/lib/permission-guard";
import { usePrefs, useProfile, useUpdatePrefs, useUpdateProfile } from "@/hooks/use-crm";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  beforeLoad: async () => {
    if (!(await ensurePermission("screen.configuracoes"))) throw redirect({ to: "/sem-acesso" });
  },
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Configurações · Star CRM" }] }),
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const { data: prefs } = usePrefs();
  const updateProfile = useUpdateProfile();
  const updatePrefs = useUpdatePrefs();

  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    if (profile) {
      setNome(profile.full_name ?? "");
      setCargo(profile.cargo ?? "");
      setEmail(profile.email ?? "");
      setTelefone(profile.telefone ?? "");
    }
  }, [profile]);

  return (
    <>
      <Topbar title="Configurações" subtitle="Ajuste sua conta e preferências do workspace." />
      <div className="grid gap-5 p-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Perfil</h2>
          <p className="text-xs text-muted-foreground">
            Estas informações aparecem para sua equipe.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nome" value={nome} onChange={setNome} />
            <Field label="Cargo" value={cargo} onChange={setCargo} />
            <Field label="E-mail" value={email} onChange={setEmail} />
            <Field label="Telefone" value={telefone} onChange={setTelefone} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              className="pill"
              disabled={updateProfile.isPending}
              onClick={() => updateProfile.mutate({ full_name: nome, cargo, email, telefone })}
            >
              {updateProfile.isPending ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-display text-xl">Notificações</h2>
          <Toggle
            label="Aprovações pendentes"
            desc="Alerta quando um cliente responde."
            checked={prefs?.aprovacoes ?? true}
            onChange={(v) => updatePrefs.mutate({ aprovacoes: v })}
          />
          <Toggle
            label="Resumo diário"
            desc="Enviado às 08h no seu e-mail."
            checked={prefs?.resumo_diario ?? true}
            onChange={(v) => updatePrefs.mutate({ resumo_diario: v })}
          />
          <Toggle
            label="Alertas de campanha"
            desc="80% do orçamento consumido."
            checked={prefs?.alerta_campanha ?? true}
            onChange={(v) => updatePrefs.mutate({ alerta_campanha: v })}
          />
        </section>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-background"
      />
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
