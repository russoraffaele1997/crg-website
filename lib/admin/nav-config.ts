import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Megaphone,
  Newspaper,
  Image as ImageIcon,
  Search,
  Settings,
  Users,
} from "lucide-react";
import type { AppRole } from "@/lib/types/admin";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omit to show to every role. Content sections stay open to collaborators (drafts only, enforced server-side). */
  roles?: AppRole[];
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Contenuti sito", href: "/admin/contenuti", icon: FileText, roles: ["super_admin", "editor"] },
  { label: "Progetti", href: "/admin/progetti", icon: Building2 },
  { label: "Comunicazioni", href: "/admin/comunicazioni", icon: Megaphone },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
  { label: "SEO", href: "/admin/seo", icon: Search, roles: ["super_admin", "editor"] },
  { label: "Impostazioni", href: "/admin/impostazioni", icon: Settings, roles: ["super_admin"] },
  { label: "Utenti Admin", href: "/admin/utenti", icon: Users, roles: ["super_admin"] },
];
