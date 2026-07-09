import { getCommunicationCategories } from "@/lib/data/communications";
import CommunicationForm from "@/components/admin/communications/CommunicationForm";

export default async function NuovaComunicazionePage() {
  const categories = await getCommunicationCategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Nuova comunicazione</h1>
      </div>
      <CommunicationForm mode="create" categories={categories} />
    </div>
  );
}
