import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export interface SettingItem {
  key: string;
  value: string;
  updatedAt: string;
}

export async function listSettings(): Promise<SettingItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("settings").select("key, value, updated_at").order("key", { ascending: true });
  if (error || !data) return [];
  return data.map((s) => ({
    key: s.key,
    value: typeof s.value === "string" ? s.value : JSON.stringify(s.value),
    updatedAt: s.updated_at,
  }));
}
