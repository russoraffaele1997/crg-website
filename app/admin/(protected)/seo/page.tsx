import { Search } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function SeoAdminPage() {
  return (
    <ComingSoon
      title="SEO"
      description="Meta title, description, canonical, Open Graph e sitemap."
      icon={Search}
      phase="Arriva nella Fase 6, insieme alla sitemap automatica e all'audit dei permessi."
    />
  );
}
