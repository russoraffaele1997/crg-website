"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Project } from "@/lib/types/project";

export default function ProjectSpotlightSection({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const words = project.title.trim().split(" ");
  const lastWord = words.pop() ?? project.title;
  const restTitle = words.join(" ");

  const availableUnits = project.units.filter((u) => u.status === "available");
  const otherUnits = project.units.length - availableUnits.length;
  const availabilityLabel =
    availableUnits.length === 0
      ? "Completo"
      : availableUnits.length === 1
      ? `${availableUnits[0].name} — Disponibile`
      : `${availableUnits.length} unità disponibili`;
  const availabilityNote = `${otherUnits} su ${project.units.length} venduti`;

  return (
    <section className="py-28 lg:py-40 bg-white overflow-hidden" ref={ref}>
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
            <h2 className="font-heading font-bold text-[46px] md:text-[58px] text-charcoal leading-[1.04] mb-6">
              {restTitle && (
                <>
                  {restTitle}
                  <br />
                </>
              )}
              <span className="text-crg-red">{lastWord}</span>
            </h2>
            <p className="font-sans text-[15px] text-mid-gray leading-relaxed mb-10 max-w-md">
              {project.shortDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/progetti/${project.slug}`} className="btn-primary">
                Vedi disponibilità
              </Link>
              <Link href="/contatti" className="btn-outline">
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

              <div className="border border-white/10 p-10 pt-12 bg-charcoal">
                <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-crg-red mb-8">
                  {project.location}
                </p>

                <div className="grid grid-cols-2 gap-px bg-white/8">
                  {project.spotlightSpecs.map((s, i) => (
                    <div key={i} className="bg-charcoal p-6">
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
                  <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${availableUnits.length > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="font-sans text-xs text-white/40">
                    {availabilityLabel}
                  </span>
                  <span className="ml-auto font-sans text-[10px] tracking-wider uppercase text-mid-gray">
                    {availabilityNote}
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
