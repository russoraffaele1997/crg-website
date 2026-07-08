import { Megaphone } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function ComunicazioniAdminPage() {
  return (
    <ComingSoon
      title="Comunicazioni"
      description="Crea, pianifica e pubblica le comunicazioni del sito."
      icon={Megaphone}
      phase="Arriva nella Fase 4, dopo Progetti, Media Library e Contenuti sito."
    />
  );
}
