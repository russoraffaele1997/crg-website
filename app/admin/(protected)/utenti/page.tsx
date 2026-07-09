import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { listAdminUsers } from "@/lib/admin/data/users";
import UsersManager from "@/components/admin/users/UsersManager";

export default async function UtentiAdminPage() {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/admin");
  const users = await listAdminUsers();

  return <UsersManager currentUserId={admin.id} initialUsers={users} />;
}
