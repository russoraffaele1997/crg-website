"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    title: "Progettazione moderna",
    description:
      "Design architettonico contemporaneo in collaborazione con studi qualificati, attento a funzionalità, estetica e integrazione nel contesto urbano.",
  },
  {
    title: "Strutture antisismiche",
    description:
      "Ogni edificio rispetta e supera le normative antisismiche con certificazioni strutturali indipendenti e tecnologie costruttive di ultima generazione.",
  },
  {
    title: "Materiali d'eccellenza",
    description:
      "Fornitori qualificati e materiali certificati dalla struttura portante alle finiture interne. Nessun compromesso sulla qualità.",
  },
  {
    title: "Efficienza energetica",
    description:
      "Classe energetica A e A+ di default. Fotovoltaico, pompe di calore, serramenti ad alte prestazioni e ventilazione meccanica controllata.",
  },
  {
    title: "Controllo qualità",
    description:
      "Direzione lavori con audit continui. Ogni fase del cantiere è documentata e verificata per garantire il rispetto degli standard definiti.",
  },
  {
    title: "Tempi certi",
    description:
      "Cronoprogrammi dettagliati e rispettati. Trasparenza totale su ogni aggiornamento dello stato di avanzamento lavori.",
  },
];

export default function WhyCRGSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 lg:py-36 bg-anthracite" ref={ref}>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:col-span-4"
          >
            <span className="section-label block mb-4">Perché CRG</span>
            <h2 className="section-title-light mb-6">
              Il metodo che fa la differenza
            </h2>
            <p className="font-sans text-sm text-white/35 leading-relaxed">
              Non costruiamo solo edifici. Sviluppiamo spazi che rispondono a
              standard elevati di qualità, sicurezza e sostenibilità, con
              attenzione costante al dettaglio in ogni fase del processo.
            </p>
          </motion.div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                className="bg-anthracite p-8 group hover:bg-charcoal transition-colors duration-300"
              >
                <div className="w-8 h-[2px] bg-crg-red mb-6 group-hover:w-14 transition-all duration-500" />
                <h3 className="font-heading text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm text-white/35 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
