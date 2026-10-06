import Link from "next/link";
import type { Project } from "@/lib/types/project";
import type { ProjectAlert } from "@/lib/projects/derive";
import { ANCHORS } from "@/lib/projects/derive";
import ClientImage from "@/components/ClientImage";
import { categoryGradients, projectStatusStyles } from "@/components/ProjectCard";

const categoryLabels: Record<string, string> = {
  residential: "Residenziale", commercial: "Commerciale", industrial: "Industriale",
};

const alertStyles: Record<ProjectAlert["tone"], { cls: string; dot: string }> = {
  info:    { cls: "bg-blue-50 text-blue-900 border-blue-200",          dot: "bg-blue-500" },
  success: { cls: "bg-emerald-50 text-emerald-900 border-emerald-200", dot: "bg-emerald-500" },
  warning: { cls: "bg-amber-50 text-amber-900 border-amber-200",       dot: "bg-amber-500" },
};

export default function ProjectHero({
  project,
  statusLine,
  hasSelectableUnits,
  alerts,
}: {
  project: Project;
  statusLine: string;
  hasSelectableUnits: boolean;
  alerts: ProjectAlert[];
}) {
  return (
    <>
      <section className="relative min-h-[560px] h-[72vh] flex items-end bg-charcoal overflow-hidden">
        <ClientImage
          src={project.coverImage} alt={project.title}
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          fallbackClass={`absolute inset-0 w-full h-full bg-gradient-to-br ${categoryGradients[project.category]}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-crg-red" />

        <div className="container-custom w-full relative z-10 pb-12 md:pb-14">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`font-sans text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border ${projectStatusStyles[project.status]}`}>
              {project.statusLabel}
            </span>
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/60">
              {categoryLabels[project.category]}
            </span>
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-6xl text-white mb-3 leading-tight">
            {project.title}
          </h1>
          <p className="font-sans text-sm text-white/60 flex items-center gap-1.5 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {project.location}
          </p>
          <p className="font-sans text-base text-white/85 max-w-xl mb-8">{statusLine}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {hasSelectableUnits ? (
              <>
                <a href={ANCHORS.units} className="btn-primary">Vedi le unità disponibili</a>
                <a href={ANCHORS.visit} className="btn-outline-light">Prenota una visita</a>
              </>
            ) : (
              <>
                <a href={ANCHORS.notify} className="btn-primary">Avvisami delle novità</a>
                <a href={ANCHORS.visit} className="btn-outline-light">Chiedi informazioni</a>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="bg-white border-b border-border-warm">
        <div className="container-custom py-4">
          <nav aria-label="Percorso" className="font-sans text-xs text-mid-gray flex items-center gap-2">
            <Link href="/" className="hover:text-crg-red transition-colors">Home</Link>
            <span aria-hidden>›</span>
            <Link href="/progetti" className="hover:text-crg-red transition-colors">Progetti</Link>
            <span aria-hidden>›</span>
            <span className="text-charcoal" aria-current="page">{project.title}</span>
          </nav>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-white">
          <div className="container-custom pt-6 space-y-2">
            {alerts.map((a) => (
              <p key={a.text} className={`flex items-center gap-3 font-sans text-sm border px-4 py-3 ${alertStyles[a.tone].cls}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${alertStyles[a.tone].dot}`} aria-hidden />
                {a.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
