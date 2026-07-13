import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sem-acesso")({
  component: NoAccess,
  head: () => ({ meta: [{ title: "Sem acesso · Star CRM" }] }),
});

function NoAccess() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-3xl">Sem acesso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você ainda não tem permissão para acessar esta área. Fale com um administrador do workspace para liberar.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
