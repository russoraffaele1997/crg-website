import Link from "next/link";
import type { Project } from "@/lib/types/project";
import ClientImage from "./ClientImage";

const categoryLabels: Record<string, string> = {
  residential: "Residenziale",
  commercial: "Commerciale",
  industrial: "Industriale",
};

const statusStyles: Record<string, string> = {
  "for-sale":           "bg-emerald-50 text-emerald-700 border-emerald-200",
  "under-construction": "bg-amber-50 text-amber-700 border-amber-200",
  "coming-soon":        "bg-blue-50 text-blue-700 border-blue-200",
  "for-rent":           "bg-purple-50 text-purple-700 border-purple-200",
};

const categoryGradients: Record<string, string> = {
  residential: "from-stone-400 to-stone-600",
  commercial:  "from-slate-400 to-slate-600",
  industrial:  "from-zinc-400 to-zinc-600",
};

interface Props { project: Project; className?: string }

export default function ProjectCard({ project, className = "" }: Props) {
  const total = project.units.length;
  const availableUnits = project.units.filter((u) => u.status === "available").length;
  const percentAvailable = total > 0 ? Math.round((availableUnits / total) * 100) : 0;
  const availability =
    total === 0
      ? null
      : availableUnits === 0
        ? { label: "Esaurito", text: "text-red-600", bar: "bg-red-500" }
        : percentAvailable <= 33
          ? { label: `${availableUnits} su ${total} disponibili`, text: "text-amber-600", bar: "bg-amber-500" }
          : { label: `${availableUnits} su ${total} disponibili`, text: "text-emerald-600", bar: "bg-emerald-500" };

  return (
    <article className={`group bg-white border border-border-warm hover:shadow-lg transition-all duration-500 flex flex-col h-full ${className}`}>

      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <ClientImage
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          fallbackClass={`w-full h-full bg-gradient-to-br ${categoryGradients[project.category]}`}
        />
        <span className={`absolute top-4 left-4 font-sans text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border ${statusStyles[project.status]}`}>
          {project.statusLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-7">
        <div className="flex items-center justify-between mb-3">
          <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-mid-gray">
            {categoryLabels[project.category]}
          </span>
        </div>

        <h3 className="font-heading text-xl font-bold text-charcoal mb-3 group-hover:text-crg-red transition-colors duration-300">
          {project.title}
        </h3>

        {availability && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`font-sans text-[11px] font-bold uppercase tracking-wide ${availability.text}`}>
                {availability.label}
              </span>
              <span className={`font-heading text-sm font-bold ${availability.text}`}>
                {percentAvailable}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-border-warm rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${availability.bar}`}
                style={{ width: `${percentAvailable}%` }}
              />
            </div>
          </div>
        )}

        <p className="font-sans text-sm text-mid-gray mb-4 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {project.location}
        </p>

        <p className="font-sans text-sm text-mid-gray leading-relaxed flex-1 mb-6">
          {project.shortDescription}
        </p>

        <Link
          href={`/progetti/${project.slug}`}
          className="font-sans text-xs tracking-[0.25em] uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-crg-red hover:border-crg-red transition-colors duration-300 self-start"
        >
          Scopri →
        </Link>
      </div>
    </article>
  );
}
