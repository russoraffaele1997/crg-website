export type AppRole = "super_admin" | "editor" | "collaborator";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}
