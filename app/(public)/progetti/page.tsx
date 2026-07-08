"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, type ProjectCategory, type ProjectStatus } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

type FilterCategory = ProjectCategory | "all";
type FilterStatus   = ProjectStatus   | "all";

const catFilters: { label: string; value: FilterCategory }[] = [
  { label: "Tutti",        value: "all" },
  { label: "Residenziale", value: "residential" },
  { label: "Commerciale",  value: "commercial" },
  { label: "Industriale",  value: "industrial" },
];

const statusFilters: { label: string; value: FilterStatus }[] = [
  { label: "Tutti",          value: "all" },
  { label: "In costruzione", value: "under-construction" },
  { label: "Disponibile",    value: "for-sale" },
  { label: "In affitto",     value: "for-rent" },
  { label: "In arrivo",      value: "coming-soon" },
];

function FilterBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`font-sans text-[11px] tracking-wider uppercase px-4 py-2 border transition-all duration-200 ${
        active
          ? "bg-crg-red text-white border-crg-red"
          : "bg-transparent text-mid-gray border-border-warm hover:border-crg-red hover:text-crg-red"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProgettiPage() {
  const [category, setCategory] = useState<FilterCategory>("all");
  const [status,   setStatus]   = useState<FilterStatus>("all");

  const filtered = projects.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (status   === "all" || p.status   === status)
  );

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

      {/* Filters */}
      <section className="sticky top-[72px] z-30 bg-white border-b border-border-warm shadow-sm">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mr-1">
                Tipo
              </span>
              {catFilters.map((f) => (
                <FilterBtn key={f.value} active={category === f.value} onClick={() => setCategory(f.value)}>
                  {f.label}
                </FilterBtn>
              ))}
            </div>
            <div className="hidden sm:block w-px bg-border-warm self-stretch" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mr-1">
                Stato
              </span>
              {statusFilters.map((f) => (
                <FilterBtn key={f.value} active={status === f.value} onClick={() => setStatus(f.value)}>
                  {f.label}
                </FilterBtn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-cream">
        <div className="container-custom">
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-heading text-2xl font-bold text-mid-gray mb-4">
                Nessun progetto trovato
              </p>
              <p className="font-sans text-sm text-mid-gray/60">
                Modifica i filtri per visualizzare altri progetti.
              </p>
            </div>
          ) : (
            <>
              <p className="font-sans text-xs text-mid-gray mb-8">
                {filtered.length} progett{filtered.length === 1 ? "o" : "i"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-warm">
                <AnimatePresence>
                  {filtered.map((project, i) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
