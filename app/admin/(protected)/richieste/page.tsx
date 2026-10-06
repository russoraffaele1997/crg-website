import { listLeads } from "@/lib/admin/data/leads";
import { getAdminProjects } from "@/lib/admin/data/projects";
import LeadsManager from "@/components/admin/leads/LeadsManager";

export default async function RichiestePage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string; progetto?: string; tipo?: string }>;
}) {
  const { stato, progetto, tipo } = await searchParams;
  const [leads, projects] = await Promise.all([
    listLeads({ status: stato, projectId: progetto, type: tipo }),
    getAdminProjects(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Richieste</h1>
        <p className="text-sm text-slate-500 mt-1">
          Appuntamenti, contatti, iscrizioni &quot;Avvisami&quot; e richieste di documenti arrivate dal sito. Arrivano anche per email.
        </p>
      </div>
      <LeadsManager
        key={`${stato ?? ""}-${progetto ?? ""}-${tipo ?? ""}`}
        leads={leads}
        projects={projects.map((p) => ({ id: p.id, title: p.title }))}
        filters={{ status: stato ?? "", projectId: progetto ?? "", type: tipo ?? "" }}
      />
    </div>
  );
}
