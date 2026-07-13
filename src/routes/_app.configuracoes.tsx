import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_app/configuracoes")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Configurações · Star CRM" },
      { name: "description", content: "Perfil, equipe e preferências do workspace." },
    ],
  }),
});

function SettingsPage() {
  return (
    <>
      <Topbar title="Configurações" subtitle="Ajuste sua conta e preferências do workspace." />
      <div className="grid gap-5 p-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Perfil</h2>
          <p className="text-xs text-muted-foreground">Estas informações aparecem para sua equipe.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nome" defaultValue="Ana Costa" />
            <Field label="Cargo" defaultValue="Head of Content" />
            <Field label="E-mail" defaultValue="ana@starcrm.co" />
            <Field label="Telefone" defaultValue="+55 11 99999-0000" />
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="pill">Salvar alterações</Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-display text-xl">Notificações</h2>
          <Toggle label="Aprovações pendentes" desc="Alerta quando um cliente responde." defaultChecked />
          <Toggle label="Resumo diário" desc="Enviado às 08h no seu e-mail." defaultChecked />
          <Toggle label="Alertas de campanha" desc="80% do orçamento consumido." />
        </section>
      </div>
    </>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={defaultValue} className="h-10 bg-background" />
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
