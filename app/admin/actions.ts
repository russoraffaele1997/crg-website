"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Called right after a successful client-side signInWithPassword. Updates
 * admin_users.last_login_at via the service-role client, since the RLS
 * update policy on admin_users is restricted to super_admin.
 */
export async function recordLogin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const service = createServiceClient();
  await service
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);
}
