import ProjectGeneralForm from "@/components/admin/projects/ProjectGeneralForm";

export default function NuovoProgettoPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Nuovo progetto</h1>
        <p className="text-sm text-slate-500 mt-1">
          Compila le informazioni generali. Gallery, caratteristiche, unità e timeline si aggiungono dopo il primo salvataggio.
        </p>
      </div>
      <ProjectGeneralForm mode="create" />
    </div>
  );
}
