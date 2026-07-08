import { Building2 } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function ProgettiAdminPage() {
  return (
    <ComingSoon
      title="Progetti"
      description="Crea e gestisci progetti, appartamenti, gallery, caratteristiche e timeline."
      icon={Building2}
      phase="Arriva nella Fase 1, subito dopo il completamento dello schema e dell'accesso admin."
    />
  );
}
