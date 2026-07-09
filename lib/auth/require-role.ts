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

/**
 * Projects, communications and blog posts are the three entities whose RLS
 * policies let a collaborator insert/update rows they own, but only while
 * `publish_status = 'draft'` — collaborators draft content, editors and
 * super admins publish it. Use this instead of `requireRole` for any action
 * that creates/edits those entities (or their sub-resources).
 */
export async function requireContentEditor(): Promise<AdminUser> {
  return requireRole(["super_admin", "editor", "collaborator"]);
}

/**
 * Sub-resource tables (gallery images, units, timeline, attachments, tags...)
 * have no `publish_status` of their own and are RLS-writable by any active
 * admin — the fine-grained "collaborators only touch drafts" rule is
 * enforced here, at the application layer, by checking the parent entity.
 * No-ops for super_admin/editor.
 */
export async function assertCollaboratorDraftOnly(
  admin: AdminUser,
  table: "projects" | "communications" | "blog_posts",
  entityId: string
): Promise<void> {
  if (admin.role !== "collaborator") return;
  const service = createServiceClient();
  const { data } = await service.from(table).select("publish_status").eq("id", entityId).maybeSingle();
  if (!data || data.publish_status !== "draft") {
    throw new Error("Come collaboratore puoi modificare solo contenuti ancora in bozza.");
  }
}
