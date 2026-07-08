import { Users } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function UtentiAdminPage() {
  return (
    <ComingSoon
      title="Utenti Admin"
      description="Invita collaboratori e assegna i ruoli: Super Admin, Editor, Collaboratore."
      icon={Users}
      phase="Arriva nella Fase 6, insieme a Impostazioni e all'audit dei permessi per ruolo."
    />
  );
}
