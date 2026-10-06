import type { Metadata } from "next";
import { getProjectSummaries } from "@/lib/data/projects";
import { getPageSeo } from "@/lib/data/seo";
import { buildMetadata } from "@/lib/seo/build-metadata";
import ProgettiFilters from "./ProgettiFilters";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/progetti");
  return buildMetadata(seo, {
    title: "Progetti — CRG | Crafted Residential Group",
    description: "Esplora il portfolio CRG: sviluppi residenziali, commerciali e industriali in diverse fasi di avanzamento.",
  });
}

export default async function ProgettiPage() {
  const projects = await getProjectSummaries();

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
