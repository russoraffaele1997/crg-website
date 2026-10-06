import type { DocumentCategory, Project, ProjectDocument } from "@/lib/types/project";
import { formatDayMonth } from "@/lib/projects/derive";
import ClientImage from "@/components/ClientImage";
import DocumentRequest from "./DocumentRequest";
import PhotoGrid from "./PhotoGrid";
import ShowMore from "./ShowMore";

// ─── Il progetto: descrizione, punti di forza, caratteristiche ─────────────
export function ProjectAbout({ project, ctaLabel }: { project: Project; ctaLabel: string }) {
  const hasSide = project.highlights.length > 0;
  return (
    <section className="py-16 bg-white border-t border-border-warm">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className={hasSide ? "lg:col-span-7" : "lg:col-span-9"}>
            <span className="section-label block mb-4">Il progetto</span>
            <p className="font-sans text-[15px] text-mid-gray leading-relaxed whitespace-pre-line mb-10">
              {project.description}
            </p>
            {project.technicalFeatures.length > 0 && (
              <>
                <h3 className="font-heading text-xl font-bold text-charcoal mb-5">Caratteristiche tecniche</h3>
                <ShowMore initial={8} moreLabel="Vedi tutte le caratteristiche" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.technicalFeatures.map((f) => (
                    <p key={f} className="font-sans text-sm text-mid-gray flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-crg-red rounded-full mt-2 shrink-0" aria-hidden />
                      {f}
                    </p>
                  ))}
                </ShowMore>
              </>
            )}
          </div>

          {hasSide && (
            <aside className="lg:col-span-5">
              <div className="bg-crg-red-light border border-crg-red/15 p-8 lg:sticky lg:top-28">
                <h3 className="font-heading text-xl font-bold text-charcoal mb-6">Punti di forza</h3>
                <ul className="space-y-4 mb-8">
                  {project.highlights.map((h) => (
                    <li key={h} className="font-sans text-sm text-charcoal flex items-start gap-3">
                      <svg className="w-4 h-4 text-crg-red mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
                <a href="#prenota" className="btn-primary w-full">{ctaLabel}</a>
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Chi realizza ──────────────────────────────────────────────────────────
export function ProjectPartners({ partners }: { partners: Project["partners"] }) {
  if (partners.length === 0) return null;
  return (
    <section className="py-14 bg-cream border-t border-border-warm">
      <div className="container-custom">
        <span className="section-label block mb-4">Chi realizza il progetto</span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {partners.map((p) => {
            const content = (
              <>
                {p.logoUrl ? (
                  <ClientImage src={p.logoUrl} alt={p.name} className="h-12 w-auto max-w-[140px] object-contain mb-4" fallbackClass="hidden" />
                ) : null}
                <p className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mb-1">{p.role}</p>
                <p className="font-heading text-base font-bold text-charcoal">{p.name}</p>
              </>
            );
            return (
              <li key={p.id} className="bg-white border border-border-warm p-6">
                {p.website ? (
                  <a href={p.website} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80">{content}</a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ─── Documenti ─────────────────────────────────────────────────────────────
const categoryLabels: Record<DocumentCategory, string> = {
  capitolato: "Capitolato",
  brochure: "Brochure",
  planimetrie: "Planimetrie",
  energetica: "Classe energetica",
  box: "Box auto",
  altro: "Altri documenti",
};
const categoryOrder: DocumentCategory[] = ["brochure", "capitolato", "planimetrie", "energetica", "box", "altro"];

export function ProjectDocuments({ projectId, documents }: { projectId: string; documents: ProjectDocument[] }) {
  if (documents.length === 0) return null;
  const groups = categoryOrder
    .map((c) => ({ category: c, docs: documents.filter((d) => d.category === c) }))
    .filter((g) => g.docs.length > 0);

  return (
    <section id="documenti" className="py-16 bg-white border-t border-border-warm scroll-mt-24">
      <div className="container-custom">
        <span className="section-label block mb-4">Documenti</span>
        <h2 className="font-heading text-3xl font-bold text-charcoal mb-2">Tutto quello che serve per decidere</h2>
        <p className="font-sans text-sm text-mid-gray mb-10 max-w-xl">
          Scarica la documentazione del progetto. Alcuni documenti te li inviamo dopo che ci hai lasciato un contatto.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {groups.map((g) => (
            <div key={g.category}>
              <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray mb-3">{categoryLabels[g.category]}</h3>
              <ul className="divide-y divide-border-warm border-y border-border-warm">
                {g.docs.map((d) => (
                  <li key={d.id} className="py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <span className="font-sans text-sm text-charcoal font-medium">{d.title}</span>
                    {d.requiresContact ? (
                      <DocumentRequest projectId={projectId} documentId={d.id} title={d.title} />
                    ) : (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-crg-red hover:underline font-medium">
                        ↓ Scarica
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Diario di cantiere ────────────────────────────────────────────────────
export function ConstructionDiary({ updates, title }: { updates: Project["updates"]; title: string }) {
  if (updates.length === 0) return null;
  return (
    <section id="diario" className="py-16 bg-light-gray border-t border-border-warm scroll-mt-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-label block mb-4">Diario di cantiere</span>
            <h2 className="font-heading text-3xl font-bold text-charcoal">Le ultime notizie dal cantiere</h2>
            <p className="font-sans text-sm text-mid-gray mt-4 leading-relaxed">
              Foto e aggiornamenti direttamente dal cantiere di {title}.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ShowMore initial={3} moreLabel="Vedi tutti gli aggiornamenti" className="space-y-10">
              {updates.map((u) => (
                <article key={u.id} className="bg-white border border-border-warm p-6 sm:p-8">
                  <time dateTime={u.publishedOn} className="font-sans text-[10px] tracking-widest uppercase text-crg-red">
                    {formatDayMonth(u.publishedOn, true)}
                  </time>
                  <h3 className="font-heading text-xl font-bold text-charcoal mt-2 mb-3">{u.title}</h3>
                  {u.body && <p className="font-sans text-sm text-mid-gray leading-relaxed whitespace-pre-line mb-5">{u.body}</p>}
                  <PhotoGrid images={u.images} alt={u.title} />
                </article>
              ))}
            </ShowMore>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Barra fissa su mobile ─────────────────────────────────────────────────
export function MobileActionBar({ phone, visitLabel }: { phone: string; visitLabel: string }) {
  const tel = phone.replace(/\s+/g, "");
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border-warm shadow-[0_-4px_16px_rgba(0,0,0,0.06)] grid grid-cols-2 gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <a href="#prenota" className="btn-primary px-4 py-3">{visitLabel}</a>
      {tel ? (
        <a href={`tel:${tel}`} className="btn-outline px-4 py-3">Chiama</a>
      ) : (
        <a href="/contatti" className="btn-outline px-4 py-3">Contatti</a>
      )}
    </div>
  );
}
