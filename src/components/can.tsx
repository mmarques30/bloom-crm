import type { ReactNode } from "react";
import { usePermissions, hasPermission } from "@/hooks/use-permissions";

export function Can({ permission, children, fallback = null }: { permission: string; children: ReactNode; fallback?: ReactNode }) {
  const { data } = usePermissions();
  if (!hasPermission(data, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
