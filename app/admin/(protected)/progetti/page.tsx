import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { getAdminProjects } from "@/lib/admin/data/projects";
import { categoryOptions, projectStatusOptions, publishStatusOptions } from "@/lib/admin/project-options";

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

const publishBadge: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-400",
};

export default async function ProgettiAdminPage() {
  const projects = await getAdminProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Progetti</h1>
          <p className="text-sm text-slate-500 mt-1">{projects.length} progetti totali</p>
        </div>
        <Link
          href="/admin/progetti/nuovo"
          className="flex items-center gap-2 bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuovo progetto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-crg-red-light flex items-center justify-center text-crg-red mb-4">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">Nessun progetto ancora</p>
          <p className="text-sm text-slate-500 mt-1">Crea il primo progetto per iniziare.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-medium text-slate-500 px-5 py-3">Progetto</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Categoria</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Stato lavori</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Unità</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Pubblicazione</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/progetti/${p.id}`} className="font-medium text-slate-900 hover:text-crg-red">
                      {p.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{p.location}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{labelFor(categoryOptions, p.category)}</td>
                  <td className="px-5 py-4 text-slate-600">{labelFor(projectStatusOptions, p.status)}</td>
                  <td className="px-5 py-4 text-slate-600">{p.totalUnits}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${publishBadge[p.publishStatus]}`}>
                      {labelFor(publishStatusOptions, p.publishStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
