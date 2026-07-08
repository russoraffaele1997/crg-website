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

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Contenuti sito", href: "/admin/contenuti", icon: FileText },
  { label: "Progetti", href: "/admin/progetti", icon: Building2 },
  { label: "Comunicazioni", href: "/admin/comunicazioni", icon: Megaphone },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
  { label: "SEO", href: "/admin/seo", icon: Search },
  { label: "Impostazioni", href: "/admin/impostazioni", icon: Settings },
  { label: "Utenti Admin", href: "/admin/utenti", icon: Users },
];
