import { supabase } from "@/integrations/supabase/client";

type Cache = { userId: string; isAdmin: boolean; keys: Set<string> } | null;
let cache: Cache = null;
let inflight: Promise<Cache> | null = null;

async function loadPermissions(): Promise<Cache> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return null;

  const [rolesRes, permsRes] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("user_permissions").select("permission_key").eq("user_id", user.id),
  ]);

  const isAdmin = (rolesRes.data ?? []).some((r) => r.role === "admin");
  const keys = new Set((permsRes.data ?? []).map((p) => p.permission_key));
  cache = { userId: user.id, isAdmin, keys };
  return cache;
}

export async function getPermissionsSnapshot() {
  if (cache) return cache;
  if (!inflight) inflight = loadPermissions().finally(() => { inflight = null; });
  return inflight;
}

export function invalidatePermissionsCache() {
  cache = null;
  inflight = null;
}

export async function ensurePermission(key: string): Promise<boolean> {
  const snap = await getPermissionsSnapshot();
  if (!snap) return false;
  return snap.isAdmin || snap.keys.has(key);
}
