import type { ProjectCategory, ProjectTimelineItem, UnitCounts } from "@/lib/types/project";
import type { NextAction } from "@/lib/projects/derive";
import { formatDayMonth, formatMonthYear, phaseState } from "@/lib/projects/derive";
import PhotoGrid from "./PhotoGrid";

function phaseDate(p: ProjectTimelineItem): string {
  return p.date || (p.sortableDate ? formatMonthYear(p.sortableDate) : "");
}

const actionStyles: Record<NextAction["tone"], string> = {
  action: "bg-crg-red text-white",
  wait:   "bg-charcoal text-white",
  done:   "bg-light-gray text-charcoal",
};

function NextActionCard({ action }: { action: NextAction }) {
  const dark = action.tone !== "done";
  return (
    <div className={`p-8 h-full flex flex-col ${actionStyles[action.tone]}`}>
      <span className={`font-sans text-[10px] tracking-[0.3em] uppercase mb-4 ${dark ? "text-white/70" : "text-crg-red"}`}>
        Cosa puoi fare adesso
      </span>
      <p className="font-heading text-2xl font-bold leading-snug mb-3">{action.title}</p>
      {action.text && <p className={`font-sans text-sm leading-relaxed mb-8 ${dark ? "text-white/80" : "text-mid-gray"}`}>{action.text}</p>}
      <a
        href={action.cta.href}
        className={`mt-auto self-start inline-flex items-center justify-center px-7 py-3.5 font-sans text-xs tracking-[0.18em] uppercase transition-colors ${
          dark ? "bg-white text-charcoal hover:bg-cream" : "bg-crg-red text-white hover:bg-crg-red-dark"
        }`}
      >
        {action.cta.label}
      </a>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mb-1">{label}</dt>
      <dd className="font-sans text-sm font-semibold text-charcoal first-letter:uppercase">{value}</dd>
    </div>
  );
}

export default function ProjectStatus({
  phases,
  progress,
  delivery,
  latestUpdate,
  counts,
  priceFrom,
  category,
  action,
}: {
  phases: ProjectTimelineItem[];
  progress: number | null;
  delivery: string | null;
  latestUpdate: string | null;
  counts: UnitCounts;
  priceFrom: string | null;
  category: ProjectCategory;
  action: NextAction | null;
}) {
  const { current, next, allDone, currentIndex } = phaseState(phases);
  const phasesWithDetails = phases.filter((p) => p.description || p.images.length > 0);

  return (
    <section id="stato" className="py-14 md:py-16 bg-white scroll-mt-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {action && (
            <div className="lg:col-span-5 order-first">
              <NextActionCard action={action} />
            </div>
          )}

          <div className={action ? "lg:col-span-7" : "lg:col-span-12"}>
            <span className="section-label block mb-3">Avanzamento</span>
            <h2 className="font-heading text-3xl font-bold text-charcoal mb-6">A che punto siamo</h2>

            {phases.length === 0 ? (
              <p className="font-sans text-sm text-mid-gray leading-relaxed max-w-lg mb-8">
                Il cantiere non è ancora partito. Qui troverai tutti gli aggiornamenti, fase per fase, dall&apos;avvio alla consegna.
              </p>
            ) : (
              <>
                {progress !== null && (
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-sans text-sm text-mid-gray">
                        {allDone ? "Lavori completati" : "Lavori completati al"}
                      </span>
                      <span className="font-heading text-2xl font-bold text-crg-red">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-border-warm rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Avanzamento lavori">
                      <div className="h-full rounded-full bg-crg-red" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {/* Stepper: vertical until there is room for every phase side by side */}
                <ol className="mb-8 flex flex-col xl:flex-row gap-0">
                  {phases.map((p, i) => {
                    const isCurrent = i === currentIndex;
                    return (
                      <li key={p.id} className="relative flex xl:flex-col xl:flex-1 xl:min-w-0 gap-3 xl:gap-2 pb-5 xl:pb-0">
                        <div className="flex xl:flex-row flex-col items-center xl:w-full">
                          <span
                            className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
                              p.completed
                                ? "bg-crg-red border-crg-red"
                                : isCurrent
                                  ? "bg-white border-crg-red ring-4 ring-crg-red/15"
                                  : "bg-white border-border-warm"
                            }`}
                            aria-hidden
                          >
                            {p.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          {i < phases.length - 1 && (
                            <span className={`flex-1 ${p.completed ? "bg-crg-red" : "bg-border-warm"} w-px xl:w-auto xl:h-px min-h-[20px] xl:min-h-0 xl:mx-1`} aria-hidden />
                          )}
                        </div>
                        <div className="xl:pr-3">
                          <p className={`font-sans text-sm leading-tight ${p.completed || isCurrent ? "text-charcoal font-medium" : "text-mid-gray"}`}>
                            {p.label}
                            {isCurrent && <span className="sr-only"> (fase attuale)</span>}
                          </p>
                          {phaseDate(p) && <p className="font-sans text-[11px] text-mid-gray mt-0.5">{phaseDate(p)}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5 border-t border-border-warm pt-6">
              {current && <Fact label="Siamo qui" value={current.label} />}
              {allDone && <Fact label="Stato" value="Lavori completati" />}
              {next && <Fact label="Prossima tappa" value={phaseDate(next) ? `${next.label}, ${phaseDate(next)}` : next.label} />}
              {delivery && <Fact label="Consegna prevista" value={delivery} />}
              {latestUpdate && <Fact label="Ultimo aggiornamento" value={formatDayMonth(latestUpdate, true)} />}
            </dl>

            {counts.total > 0 && (
              <p className="font-sans text-sm text-mid-gray mt-6">
                <span className="text-emerald-700 font-semibold">{counts.available} disponibil{counts.available === 1 ? "e" : "i"}</span>
                {counts.optioned > 0 && <> · <span className="text-amber-700 font-semibold">{counts.optioned} prenotat{counts.optioned === 1 ? "a" : "e"}</span></>}
                {counts.closed > 0 && <> · {counts.closed} vendut{counts.closed === 1 ? "a" : "e"}</>}
                {" "}su {counts.total} {category === "residential" ? "appartamenti" : "unità"}
                {priceFrom && <> · prezzi da <span className="text-charcoal font-semibold">{priceFrom}</span></>}
              </p>
            )}

            {phasesWithDetails.length > 0 && (
              <details className="mt-8 group border-t border-border-warm pt-6">
                <summary className="cursor-pointer list-none font-sans text-xs tracking-[0.2em] uppercase text-charcoal hover:text-crg-red">
                  <span className="group-open:hidden">Racconto delle fasi, con foto →</span>
                  <span className="hidden group-open:inline">Chiudi il racconto delle fasi</span>
                </summary>
                <ol className="mt-6 space-y-8">
                  {phasesWithDetails.map((p) => (
                    <li key={p.id} className="border-l-2 border-crg-red/30 pl-5">
                      <p className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mb-1">
                        {phaseDate(p)} {p.completed ? "· completata" : ""}
                      </p>
                      <h3 className="font-heading text-lg font-bold text-charcoal mb-2">{p.label}</h3>
                      {p.description && <p className="font-sans text-sm text-mid-gray leading-relaxed whitespace-pre-line mb-4">{p.description}</p>}
                      <PhotoGrid images={p.images} alt={p.label} />
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
