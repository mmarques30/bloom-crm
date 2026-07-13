import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Megaphone,
  BarChart3,
  Settings,
  LifeBuoy,
  Search,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Operacional",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/clientes", label: "Clientes", icon: Users },
      { to: "/calendario", label: "Calendário", icon: CalendarDays },
      { to: "/campanhas", label: "Campanhas", icon: Megaphone },
    ],
  },
  {
    title: "Analítico",
    items: [{ to: "/analytics", label: "Performance", icon: BarChart3 }],
  },
  {
    title: "Sistema",
    items: [
      { to: "/configuracoes", label: "Configurações", icon: Settings },
      { to: "/ajuda", label: "Ajuda & suporte", icon: LifeBuoy },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex h-screen w-[260px] shrink-0 flex-col border-r border-border bg-sidebar sticky top-0">
      <div className="px-5 pt-6 pb-4">
        <BrandMark />
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar…"
            className="pill h-9 border-transparent bg-muted pl-9 text-sm focus-visible:bg-card"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3 pb-4">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {g.title}
            </div>
            <ul className="space-y-1">
              {g.items.map((item) => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-4 mb-5 rounded-2xl card-ink p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/80 flex items-center justify-center font-semibold">
            AC
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium">Ana Costa</div>
            <div className="text-[11px] text-white/60">Head of Content</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
