import { Image as ImageIcon } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function MediaLibraryAdminPage() {
  return (
    <ComingSoon
      title="Media Library"
      description="Carica, organizza e riusa immagini, video e documenti."
      icon={ImageIcon}
      phase="Arriva nella Fase 2, subito dopo che il CMS Progetti sarà collegato al frontend."
    />
  );
}
