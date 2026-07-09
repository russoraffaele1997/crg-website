"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createServiceClient } from "@/lib/supabase/service";

export async function upsertSetting(key: string, value: string) {
  await requireRole(["super_admin"]);
  if (!key.trim()) throw new Error("La chiave non può essere vuota.");
  const service = createServiceClient();
  const { error } = await service.from("settings").upsert({ key: key.trim(), value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/impostazioni");
}

export async function deleteSetting(key: string) {
  await requireRole(["super_admin"]);
  const service = createServiceClient();
  const { error } = await service.from("settings").delete().eq("key", key);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/impostazioni");
}
