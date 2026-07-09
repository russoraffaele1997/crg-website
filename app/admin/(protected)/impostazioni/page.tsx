import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { listSettings } from "@/lib/admin/data/settings";
import SettingsManager from "@/components/admin/settings/SettingsManager";

export default async function ImpostazioniAdminPage() {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/admin");
  const settings = await listSettings();

  return <SettingsManager initialSettings={settings} />;
}
