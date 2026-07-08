import { FileText } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function ContenutiSitoPage() {
  return (
    <ComingSoon
      title="Contenuti sito"
      description="Modifica homepage, chi siamo, footer, menu e contatti."
      icon={FileText}
      phase="Arriva nella Fase 3 (Site Content + cronologia modifiche), dopo Progetti e Media Library."
    />
  );
}
