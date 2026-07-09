"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";
import type { AppRole } from "@/lib/types/admin";

export interface CreateAdminUserInput {
  email: string;
  fullName: string;
  role: AppRole;
  password: string;
}

/**
 * Supabase invite-by-email requires SMTP to be configured on the project,
 * which we can't assume is set up. Creating the auth user directly with an
 * admin-chosen password sidesteps that dependency — the super admin shares
 * the password out of band and the new user can change it after first login.
 */
export async function createAdminUser(input: CreateAdminUserInput): Promise<{ id: string }> {
  await requireRole(["super_admin"]);
  const service = createServiceClient();

  const { data: authUser, error: authError } = await service.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    throw new Error(authError?.message ?? "Creazione utente non riuscita.");
  }

  const { error } = await service.from("admin_users").insert({
    id: authUser.user.id,
    email: input.email,
    full_name: input.fullName || null,
    role: input.role,
    is_active: true,
  });

  if (error) {
    // Roll back the orphaned auth user rather than leave a login with no profile row.
    await service.auth.admin.deleteUser(authUser.user.id);
    throw new Error(error.message);
  }

  revalidatePath("/admin/utenti");
  return { id: authUser.user.id };
}

export async function updateAdminUserRole(id: string, role: AppRole) {
  const admin = await requireRole(["super_admin"]);
  if (id === admin.id && role !== "super_admin") {
    throw new Error("Non puoi rimuovere il tuo stesso ruolo di Super Admin.");
  }
  const service = createServiceClient();
  const { error } = await service.from("admin_users").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/utenti");
}

export async function setAdminUserActive(id: string, isActive: boolean) {
  const admin = await requireRole(["super_admin"]);
  if (id === admin.id && !isActive) {
    throw new Error("Non puoi disattivare il tuo stesso account.");
  }
  const service = createServiceClient();
  const { error } = await service.from("admin_users").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/utenti");
}
