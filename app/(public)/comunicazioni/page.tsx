import type { Metadata } from "next";
import { getCommunications, getCommunicationCategories } from "@/lib/data/communications";
import ComunicazioniFilters from "./ComunicazioniFilters";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Comunicazioni — CRG | Crafted Residential Group",
  description: "Tutte le comunicazioni e gli aggiornamenti di CRG | Crafted Residential Group.",
};

export default async function ComunicazioniPage() {
  const [communications, categories] = await Promise.all([
    getCommunications(),
    getCommunicationCategories(),
  ]);

  return (
    <>
      <section className="pt-40 pb-20 bg-charcoal">
        <div className="container-custom">
          <span className="section-label block mb-6">Comunicazioni</span>
          <h1 className="section-title-light max-w-2xl">Notizie e aggiornamenti</h1>
          <p className="font-sans text-sm text-white/35 mt-4 max-w-xl leading-relaxed">
            Tutte le comunicazioni ufficiali di CRG: aggiornamenti sui progetti, novità e annunci.
          </p>
        </div>
      </section>

      <ComunicazioniFilters communications={communications} categories={categories} />
    </>
  );
}
