import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { invalidatePermissionsCache } from "@/lib/permission-guard";

export type PermissionsSnapshot = {
  userId: string | null;
  isAdmin: boolean;
  keys: Set<string>;
};

async function fetchPermissions(): Promise<PermissionsSnapshot> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return { userId: null, isAdmin: false, keys: new Set() };

  const [rolesRes, permsRes] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("user_permissions").select("permission_key").eq("user_id", user.id),
  ]);

  return {
    userId: user.id,
    isAdmin: (rolesRes.data ?? []).some((r) => r.role === "admin"),
    keys: new Set((permsRes.data ?? []).map((p) => p.permission_key)),
  };
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
    staleTime: 60_000,
  });
}

export function hasPermission(snap: PermissionsSnapshot | undefined, key: string): boolean {
  if (!snap) return false;
  return snap.isAdmin || snap.keys.has(key);
}

export { invalidatePermissionsCache };
