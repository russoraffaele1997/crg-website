import type { Metadata } from "next";
import {
  getAboutHeroContent,
  getAboutMissionContent,
  getAboutValuesContent,
  getAboutProcessContent,
  getAboutCtaContent,
} from "@/lib/data/site-content";
import { getPageSeo } from "@/lib/data/seo";
import { buildMetadata } from "@/lib/seo/build-metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/chi-siamo");
  return buildMetadata(seo, {
    title: "Chi siamo — CRG | Crafted Residential Group",
    description:
      "CRG nasce con l'obiettivo di trasformare terreni e fabbricati in progetti immobiliari moderni, funzionali e sostenibili. Scopri la nostra storia e il nostro metodo.",
  });
}

export default async function ChiSiamoPage() {
  const [hero, mission, values, process, cta] = await Promise.all([
    getAboutHeroContent(),
    getAboutMissionContent(),
    getAboutValuesContent(),
    getAboutProcessContent(),
    getAboutCtaContent(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-24 bg-charcoal">
        <div className="container-custom">
          <span className="section-label block mb-6">{hero.eyebrow}</span>
          <h1 className="section-title-light max-w-3xl leading-[1.08] mb-8">
            {hero.titleLine1}<br />
            <span className="text-crg-red">{hero.titleAccent}</span>
          </h1>
          <p className="font-sans text-base text-white/40 max-w-2xl leading-relaxed">
            {hero.body}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-200 to-stone-400 relative overflow-hidden">
                <div className="absolute inset-4 border border-charcoal/10" />
                <div className="absolute top-8 left-8">
                  <div className="w-12 h-1 bg-crg-red mb-2" />
                  <div className="w-6 h-1 bg-crg-red/40" />
                </div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="font-heading font-bold text-6xl text-white/20">CRG</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <span className="section-label block mb-4">{mission.eyebrow}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-6 leading-tight">
                {mission.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </h2>
              <div className="space-y-4 font-sans text-[15px] text-mid-gray leading-relaxed">
                <p>{mission.paragraph1}</p>
                <p>{mission.paragraph2}</p>
                <p>{mission.paragraph3}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-light-gray">
        <div className="container-custom">
          <span className="section-label block mb-4">{values.eyebrow}</span>
          <h2 className="section-title mb-14 max-w-md">
            {values.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-warm">
            {values.items.map((value, i) => (
              <div
                key={i}
                className="bg-white p-10 group hover:bg-crg-red-light transition-colors duration-300"
              >
                <div className="w-8 h-[2px] bg-crg-red mb-6 group-hover:w-14 transition-all duration-500" />
                <h3 className="font-heading text-xl font-bold text-charcoal mb-3">
                  {value.title}
                </h3>
                <p className="font-sans text-sm text-mid-gray leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-anthracite">
        <div className="container-custom">
          <span className="section-label block mb-4">{process.eyebrow}</span>
          <h2 className="section-title-light mb-16 max-w-lg">
            {process.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/8">
            {process.steps.map((step, i) => (
              <div key={i} className="bg-anthracite p-8 group hover:bg-charcoal transition-colors duration-300">
                <div className="font-heading font-bold text-5xl text-crg-red/20 mb-4">
                  {step.number}
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-white/35 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-cream">
        <div className="container-custom text-center">
          <h2 className="section-title mb-4 max-w-xl mx-auto">
            {cta.title}
          </h2>
          <p className="font-sans text-sm text-mid-gray mb-10 max-w-md mx-auto">
            {cta.body}
          </p>
          <a href="/contatti" className="btn-primary">{cta.ctaLabel}</a>
        </div>
      </section>
    </>
  );
}
