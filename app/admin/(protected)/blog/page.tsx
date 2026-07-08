import { Newspaper } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function BlogAdminPage() {
  return (
    <ComingSoon
      title="Blog"
      description="Scrivi articoli con l'editor a blocchi, categorie e tag."
      icon={Newspaper}
      phase="Arriva nella Fase 5, la più corposa: schema e CRUD, poi l'editor a blocchi Tiptap."
    />
  );
}
