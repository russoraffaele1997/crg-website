import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import type { AppRole } from "@/lib/types/admin";

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, full_name, role, is_active, last_login_at, created_at")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    role: u.role,
    isActive: u.is_active,
    lastLoginAt: u.last_login_at,
    createdAt: u.created_at,
  }));
}
