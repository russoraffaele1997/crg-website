"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const services = [
  {
    number: "01",
    title: "Acquisto e valorizzazione aree",
    description:
      "Identifichiamo terreni e fabbricati con alto potenziale di sviluppo. Analizziamo ogni opportunità con approccio strategico, valutando localizzazione, normativa urbanistica e rendimento atteso.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <rect x="4" y="28" width="32" height="8" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 28 L20 8 L36 28" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="20" cy="21" r="3.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Demolizione e ricostruzione",
    description:
      "Gestiamo l'intero ciclo edilizio: demolizione certificata, bonifica del sito, progettazione architettonica e strutturale, direzione lavori e controllo qualità in ogni fase.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <rect x="6" y="8" width="28" height="24" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 20 H34" stroke="currentColor" strokeWidth="1.2" />
        <path d="M16 20 V32" stroke="currentColor" strokeWidth="1.2" />
        <path d="M24 20 V32" stroke="currentColor" strokeWidth="1.2" />
        <path d="M14 8 V20" stroke="currentColor" strokeWidth="1.2" />
        <path d="M26 8 V20" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Vendita e locazione immobiliare",
    description:
      "Commercializziamo direttamente i nostri sviluppi con assistenza completa. Residenze, uffici e spazi industriali disponibili all'acquisto, in locazione o con formula rent-to-buy.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <path d="M8 32 V18 L20 8 L32 18 V32" stroke="currentColor" strokeWidth="1.2" />
        <rect x="15" y="22" width="10" height="10" stroke="currentColor" strokeWidth="1.2" />
        <path d="M20 8 V4" stroke="currentColor" strokeWidth="1.2" />
        <path d="M27.5 27 L29.5 29 L33 25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function WhatWeDoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 lg:py-36 bg-cream" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 md:mb-20"
        >
          <span className="section-label block mb-4">Cosa facciamo</span>
          <h2 className="section-title max-w-xl">
            Sviluppo immobiliare a 360°
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-warm">
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.14 }}
              className="bg-cream p-10 group hover:bg-crg-red-light transition-colors duration-500"
            >
              <div className="text-mid-gray group-hover:text-crg-red transition-colors duration-300 mb-8">
                {service.icon}
              </div>
              <div className="font-sans text-[10px] tracking-[0.3em] uppercase text-mid-gray mb-3">
                {service.number}
              </div>
              <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                {service.title}
              </h3>
              <p className="font-sans text-sm text-mid-gray leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
