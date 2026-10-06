import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectSummaries } from "@/lib/data/projects";
import { getCompanyInfoContent } from "@/lib/data/site-content";
import { getEntitySeoBySlug } from "@/lib/data/seo";
import { buildMetadata } from "@/lib/seo/build-metadata";
import {
  computeProgress,
  countUnits,
  deliveryLabel,
  nextAction,
  phaseState,
  priceFrom,
  projectAlerts,
  todayIso,
} from "@/lib/projects/derive";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectStatus from "@/components/project/ProjectStatus";
import UnitsSection from "@/components/project/UnitsSection";
import PhotoGrid from "@/components/project/PhotoGrid";
import ProjectMap from "@/components/project/ProjectMap";
import VisitForm from "@/components/project/VisitForm";
import NotifyForm from "@/components/project/NotifyForm";
import { VisitProvider } from "@/components/project/VisitContext";
import {
  ConstructionDiary,
  MobileActionBar,
  ProjectAbout,
  ProjectDocuments,
  ProjectPartners,
} from "@/components/project/ProjectExtras";
import { categoryGradients } from "@/components/ProjectCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getProjectSummaries();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, seo] = await Promise.all([getProjectBySlug(slug), getEntitySeoBySlug("projects", slug)]);
  if (!project) return {};
  return buildMetadata(seo, {
    title: `${project.title} — CRG | Crafted Residential Group`,
    description: project.shortDescription,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const [project, companyInfo] = await Promise.all([getProjectBySlug(slug), getCompanyInfoContent()]);
  if (!project) notFound();

  const today = todayIso();
  const counts = countUnits(project.units);
  const hasSelectableUnits = counts.available + counts.optioned > 0;
  const progress = computeProgress(project.timeline);
  const delivery = deliveryLabel(project);
  const latestUpdate = project.updates[0]?.publishedOn ?? null;
  const { current, allDone } = phaseState(project.timeline);
  const action = nextAction({ category: project.category, status: project.status, counts, messaging: project, today });
  const alerts = projectAlerts({ messaging: project, latestUpdate, today });

  // One plain sentence under the title answering "where are we?".
  const statusLine = [
    allDone ? "Lavori completati" : current ? `Fase attuale: ${current.label}` : null,
    progress !== null && !allDone ? `cantiere al ${progress}%` : null,
    delivery ? `consegna prevista ${delivery}` : null,
  ]
    .filter(Boolean)
    .join(" · ") || project.shortDescription;

  // "Keep scrolling to pick your apartment" — shown right above the units list.
  const unitsCue = counts.total > 0 ? (
    <a
      href="#unita"
      className="group mt-10 flex flex-col items-center gap-2 text-center"
      aria-label="Vai alla scelta delle unità"
    >
      <span className="font-heading text-lg font-bold text-charcoal group-hover:text-crg-red transition-colors">
        {project.category === "residential" ? "Scegli il tuo appartamento" : "Scegli la tua unità"}
      </span>
      <span className="font-sans text-sm text-mid-gray">
        {hasSelectableUnits
          ? `${counts.available + counts.optioned} su ${counts.total} ancora disponibili: scorri per vedere piante, foto e prezzi`
          : "Scorri per vedere tutte le unità del progetto"}
      </span>
      <span className="mt-1 w-11 h-11 rounded-full bg-crg-red text-white flex items-center justify-center animate-bounce group-hover:bg-crg-red-dark" aria-hidden>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </a>
  ) : null;

  return (
    <VisitProvider>
      <ProjectHero project={project} statusLine={statusLine} hasSelectableUnits={hasSelectableUnits} alerts={alerts} />

      <ProjectStatus
        phases={project.timeline}
        progress={progress}
        delivery={delivery}
        latestUpdate={latestUpdate}
        counts={counts}
        priceFrom={priceFrom(project.units)}
        category={project.category}
        action={action}
      />

      {project.mapAddress && (
        <section id="dove" className="pt-16 pb-10 bg-light-gray border-t border-border-warm scroll-mt-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-4">
                <span className="section-label block mb-4">Posizione</span>
                <h2 className="font-heading text-3xl font-bold text-charcoal mb-4">Dove si trova</h2>
                <p className="font-sans text-sm text-mid-gray leading-relaxed">
                  {project.title} sorge a {project.location}. Vieni a vedere il cantiere: prenota una visita e ti accompagniamo noi.
                </p>
              </div>
              <div className="lg:col-span-8">
                <ProjectMap address={project.mapAddress} title={project.title} />
              </div>
            </div>
            {unitsCue}
          </div>
        </section>
      )}

      {!project.mapAddress && unitsCue && <div className="bg-white pb-10"><div className="container-custom">{unitsCue}</div></div>}

      <section id="unita" className="py-16 bg-cream border-t border-border-warm scroll-mt-24">
        <div className="container-custom">
          <span className="section-label block mb-4">Disponibilità</span>
          <h2 className="font-heading text-3xl font-bold text-charcoal mb-6">Scegli la tua unità</h2>
          <UnitsSection
            units={project.units}
            carBoxes={project.carBoxes}
            carBoxPlanUrl={project.carBoxPlanUrl}
            category={project.category}
          />
        </div>
      </section>

      <section className="py-16 bg-white border-t border-border-warm">
        <div className="container-custom">
          <span className="section-label block mb-6">Galleria</span>
          {project.gallery.length > 0 ? (
            <PhotoGrid
              images={project.gallery}
              alt={project.title}
              layout="gallery"
              fallbackClass={`w-full h-full bg-gradient-to-br ${categoryGradients[project.category]}`}
            />
          ) : (
            <p className="font-sans text-sm text-mid-gray">Le prime immagini del progetto arriveranno a breve.</p>
          )}
        </div>
      </section>

      <ProjectAbout project={project} ctaLabel={hasSelectableUnits ? "Prenota una visita" : "Chiedi informazioni"} />
      <ProjectPartners partners={project.partners} />
      <ProjectDocuments projectId={project.id} documents={project.documents} />
      <ConstructionDiary updates={project.updates} title={project.title} />

      <section id="prenota" className="py-16 bg-cream border-t border-border-warm scroll-mt-24 pb-28 md:pb-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <span className="section-label block mb-4">Contatto</span>
              <h2 className="font-heading text-3xl font-bold text-charcoal mb-2">
                {hasSelectableUnits ? "Prenota una visita" : "Chiedi informazioni"}
              </h2>
              <p className="font-sans text-sm text-mid-gray mb-10 leading-relaxed">
                {hasSelectableUnits
                  ? "Scegli giorno e orario che preferisci: un nostro consulente ti ricontatta per confermare e ti accompagna in visita."
                  : "Scrivici per qualsiasi domanda su questo progetto: ti rispondiamo entro 24 ore lavorative."}
              </p>
              <VisitForm
                projectId={project.id}
                projectTitle={project.title}
                units={project.units}
                carBoxes={project.carBoxes}
                mode={hasSelectableUnits ? "visit" : "info"}
              />
            </div>

            <aside id="avvisami" className="lg:col-span-5 scroll-mt-24">
              <div className="bg-white border border-border-warm p-8">
                <h3 className="font-heading text-xl font-bold text-charcoal mb-2">Avvisami delle novità</h3>
                <p className="font-sans text-sm text-mid-gray leading-relaxed mb-6">
                  {hasSelectableUnits
                    ? "Non sei pronto per una visita? Ti scriviamo quando ci sono aggiornamenti dal cantiere o nuove unità."
                    : "Ti scriviamo per primi se un'unità torna disponibile o se apriamo nuove vendite."}
                </p>
                <NotifyForm projectId={project.id} projectTitle={project.title} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <MobileActionBar phone={companyInfo.phone} visitLabel={hasSelectableUnits ? "Prenota visita" : "Informazioni"} />
    </VisitProvider>
  );
}
