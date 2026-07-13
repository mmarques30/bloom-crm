import { Bell, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrmDialogs } from "@/components/crm-dialogs";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const dialogs = useCrmDialogs();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 bg-background/60 px-6 py-5 backdrop-blur">
      <div>
        <h1 className="font-display text-3xl leading-none">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="pill h-9 gap-2 border-border bg-card">
          Últimos 30 dias
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="pill h-9 w-9 border-border bg-card">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          className="pill h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => dialogs.openConteudo()}
        >
          <Plus className="h-4 w-4" />
          Novo post
        </Button>
      </div>
    </div>
  );
}
