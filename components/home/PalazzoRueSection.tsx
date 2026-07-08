"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const specs = [
  { value: "5", label: "Unità residenziali" },
  { value: "109", label: "Mq per appartamento" },
  { value: "260", label: "Mq terrazzo attico" },
  { value: "NZEB", label: "Classe energetica" },
];

export default function PalazzoRueSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 lg:py-40 bg-anthracite overflow-hidden" ref={ref}>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Left — text */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label block mb-6">Progetto in evidenza</span>
            <h2 className="font-heading font-bold text-[46px] md:text-[58px] text-white leading-[1.04] mb-6">
              Palazzo
              <br />
              <span className="text-crg-red">Rue</span>
            </h2>
            <p className="font-sans text-[15px] text-white/45 leading-relaxed mb-4 max-w-md">
              Cinque residenze esclusive a Casoria (NA), nate dalla
              valorizzazione di un palazzo storico. Finiture artigianali su
              misura, domotica integrata e standard energetici NZEB.
            </p>
            <p className="font-sans text-[15px] text-white/45 leading-relaxed mb-10 max-w-md">
              L&rsquo;attico al quinto e sesto piano offre 105 mq interni e
              un terrazzo panoramico esclusivo da 260 mq — l&rsquo;unica unità
              ancora disponibile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/progetti/palazzo-rue" className="btn-primary">
                Vedi disponibilità
              </Link>
              <Link href="/contatti" className="btn-outline-light">
                Richiedi informazioni
              </Link>
            </div>
          </motion.div>

          {/* Right — specs card */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="relative">
              {/* Accent line */}
              <div className="absolute top-0 left-0 w-12 h-[3px] bg-crg-red" />

              <div className="border border-white/10 p-10 pt-12 bg-charcoal/60">
                <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-crg-red mb-8">
                  Casoria, NA — 2026
                </p>

                <div className="grid grid-cols-2 gap-px bg-white/8">
                  {specs.map((s) => (
                    <div key={s.label} className="bg-charcoal/60 p-6">
                      <div className="font-heading font-bold text-4xl text-white mb-1">
                        {s.value}
                      </div>
                      <div className="font-sans text-[10px] tracking-widest uppercase text-white/30">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-sans text-xs text-white/40">
                    Attico E05 — Disponibile
                  </span>
                  <span className="ml-auto font-sans text-[10px] tracking-wider uppercase text-mid-gray">
                    4 su 5 venduti
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
