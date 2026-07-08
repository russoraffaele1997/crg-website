import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { AdminUser, AppRole } from "@/lib/types/admin";

/**
 * Resolves the currently signed-in admin (or null if not logged in / not an
 * active admin_users row). Reads the auth session via the cookie-aware
 * client, then looks up the profile row via the service-role client (RLS on
 * admin_users would also allow a user to read their own row, but the
 * service-role path keeps this function consistent with every other data
 * read in the app).
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const service = createServiceClient();
  const { data: adminUser } = await service
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminUser || !adminUser.is_active) return null;

  return adminUser as AdminUser;
}

/**
 * Use at the top of any admin Server Component/layout that must be signed
 * in. (middleware.ts already redirects unauthenticated requests away from
 * /admin/**, this is the second, defense-in-depth check inside the render.)
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/**
 * Use at the top of any Server Action that mutates data and is restricted to
 * specific roles (e.g. publish/delete/user-management). Never trust a
 * disabled/hidden button client-side — this is the real enforcement point.
 */
export async function requireRole(roles: AppRole[]): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (!roles.includes(admin.role)) {
    throw new Error("Non sei autorizzato a eseguire questa azione.");
  }
  return admin;
}
