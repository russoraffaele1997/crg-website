import Link from "next/link";
import type { ProjectSummary } from "@/lib/types/project";
import { unitNoun } from "@/lib/projects/derive";
import ClientImage from "./ClientImage";

const categoryLabels: Record<string, string> = {
  residential: "Residenziale",
  commercial: "Commerciale",
  industrial: "Industriale",
};

export const projectStatusStyles: Record<string, string> = {
  "for-sale":           "bg-emerald-50 text-emerald-700 border-emerald-200",
  "under-construction": "bg-amber-50 text-amber-700 border-amber-200",
  "coming-soon":        "bg-blue-50 text-blue-700 border-blue-200",
  "for-rent":           "bg-purple-50 text-purple-700 border-purple-200",
};

export const categoryGradients: Record<string, string> = {
  residential: "from-stone-400 to-stone-600",
  commercial:  "from-slate-400 to-slate-600",
  industrial:  "from-zinc-400 to-zinc-600",
};

/** Plain-language availability line: never "sold out" while something can still be visited. */
export function availabilityText(p: Pick<ProjectSummary, "units" | "category">): { text: string; cls: string } | null {
  const { total, available, optioned } = p.units;
  if (total === 0) return null;
  if (available > 0) {
    return {
      text: `${available} ${unitNoun(p.category, available)} disponibil${available === 1 ? "e" : "i"} su ${total}`,
      cls: "text-emerald-700",
    };
  }
  if (optioned > 0) return { text: "Tutte prenotate: iscriviti per sapere se si liberano", cls: "text-amber-700" };
  return { text: "Tutto venduto", cls: "text-mid-gray" };
}

interface Props { project: ProjectSummary; className?: string }

export default function ProjectCard({ project, className = "" }: Props) {
  const availability = availabilityText(project);
  const badge = project.lowStock
    ? "Ultime unità"
    : project.recentUpdate
      ? "Nuovo aggiornamento cantiere"
      : null;

  return (
    <article className={`group relative bg-white border border-border-warm hover:shadow-lg transition-all duration-500 flex flex-col h-full ${className}`}>

      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <ClientImage
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          fallbackClass={`w-full h-full bg-gradient-to-br ${categoryGradients[project.category]}`}
        />
        <span className={`absolute top-4 left-4 font-sans text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border ${projectStatusStyles[project.status]}`}>
          {project.statusLabel}
        </span>
        {badge && (
          <span className="absolute top-4 right-4 font-sans text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 bg-crg-red text-white">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-7">
        <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-mid-gray mb-2">
          {categoryLabels[project.category]} · {project.location}
        </span>

        <h3 className="font-heading text-xl font-bold text-charcoal mb-4 group-hover:text-crg-red transition-colors duration-300">
          {project.title}
        </h3>

        {project.progress !== null && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans text-[11px] uppercase tracking-wide text-mid-gray">Avanzamento cantiere</span>
              <span className="font-heading text-sm font-bold text-charcoal">{project.progress}%</span>
            </div>
            <div
              className="h-1.5 w-full bg-border-warm rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Avanzamento cantiere"
            >
              <div className="h-full rounded-full bg-crg-red" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        )}

        <dl className="font-sans text-sm space-y-1.5 mb-6 flex-1">
          {project.deliveryLabel && (
            <div className="flex gap-1.5">
              <dt className="text-mid-gray">Consegna prevista:</dt>
              <dd className="text-charcoal font-medium first-letter:uppercase">{project.deliveryLabel}</dd>
            </div>
          )}
          {availability && (
            <div>
              <dt className="sr-only">Disponibilità</dt>
              <dd className={`font-medium ${availability.cls}`}>
                {availability.text}
                {project.priceFrom && project.units.available + project.units.optioned > 0 && (
                  <span className="text-mid-gray font-normal"> · da {project.priceFrom}</span>
                )}
              </dd>
            </div>
          )}
          {!project.deliveryLabel && !availability && (
            <dd className="text-mid-gray leading-relaxed">{project.shortDescription}</dd>
          )}
        </dl>

        {/* The whole card is clickable through the stretched link. */}
        <Link
          href={`/progetti/${project.slug}`}
          className="font-sans text-xs tracking-[0.25em] uppercase text-charcoal border-b border-charcoal pb-0.5 group-hover:text-crg-red group-hover:border-crg-red transition-colors duration-300 self-start after:absolute after:inset-0"
        >
          Scopri il progetto →
        </Link>
      </div>
    </article>
  );
}
