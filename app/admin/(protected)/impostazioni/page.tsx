import { Settings } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function ImpostazioniAdminPage() {
  return (
    <ComingSoon
      title="Impostazioni"
      description="Parametri generali del sito e dell'area amministrazione."
      icon={Settings}
      phase="Arriva nella Fase 6, insieme alla gestione utenti e all'audit dei permessi."
    />
  );
}
