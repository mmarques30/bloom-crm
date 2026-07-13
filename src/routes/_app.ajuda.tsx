import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { LifeBuoy, Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_app/ajuda")({
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "Ajuda & suporte · Star CRM" },
      { name: "description", content: "Central de ajuda, documentação e canais de contato." },
    ],
  }),
});

function HelpPage() {
  return (
    <>
      <Topbar title="Ajuda & suporte" subtitle="Estamos por aqui quando você precisar." />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        {[
          { icon: LifeBuoy, title: "Central de ajuda", desc: "Guias passo a passo e melhores práticas." },
          { icon: MessageCircle, title: "Chat com a equipe", desc: "Segunda a sexta, das 9h às 19h." },
          { icon: Mail, title: "E-mail", desc: "ajuda@starcrm.co · resposta em até 4h." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <c.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-xl">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}
