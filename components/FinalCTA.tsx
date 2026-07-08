"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 lg:py-40 bg-charcoal relative overflow-hidden" ref={ref}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-crg-red" />

      {/* Decorative CRG mark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
        <span className="font-heading font-bold text-[28vw] text-white/[0.025] leading-none">
          CRG
        </span>
      </div>

      <div className="container-custom relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label block mb-6">Inizia ora</span>
          <h2 className="section-title-light max-w-3xl mx-auto mb-6">
            Stai cercando un immobile o vuoi conoscere i nostri prossimi sviluppi?
          </h2>
          <p className="font-sans text-sm text-white/35 max-w-lg mx-auto mb-12">
            Il nostro team è disponibile per rispondere a ogni domanda e
            accompagnarti in ogni fase del processo di acquisto o locazione.
          </p>
          <Link href="/contatti" className="btn-primary">
            Prenota un appuntamento
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
