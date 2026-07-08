import { getProjects } from "@/lib/data/projects";
import ProgettiFilters from "./ProgettiFilters";

export const revalidate = 300;

export default async function ProgettiPage() {
  const projects = await getProjects();

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-20 bg-charcoal">
        <div className="container-custom">
          <span className="section-label block mb-6">Portfolio</span>
          <h1 className="section-title-light max-w-2xl">I nostri progetti</h1>
          <p className="font-sans text-sm text-white/35 mt-4 max-w-xl leading-relaxed">
            Esplora il portfolio CRG: sviluppi residenziali, commerciali e
            industriali in diverse fasi di avanzamento.
          </p>
        </div>
      </section>

      <ProgettiFilters projects={projects} />
    </>
  );
}
