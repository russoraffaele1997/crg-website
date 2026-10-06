"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjectCategory, ProjectStatus, ProjectSummary } from "@/lib/types/project";
import ProjectCard from "@/components/ProjectCard";

type FilterCategory = ProjectCategory | "all";
type FilterStatus   = ProjectStatus   | "all";

const catFilters: { label: string; value: FilterCategory; param: string }[] = [
  { label: "Tutti",        value: "all",         param: "" },
  { label: "Residenziale", value: "residential", param: "residenziale" },
  { label: "Commerciale",  value: "commercial",  param: "commerciale" },
  { label: "Industriale",  value: "industrial",  param: "industriale" },
];

const statusFilters: { label: string; value: FilterStatus; param: string }[] = [
  { label: "Tutti",          value: "all",                param: "" },
  { label: "Disponibile",    value: "for-sale",           param: "in-vendita" },
  { label: "In costruzione", value: "under-construction", param: "in-costruzione" },
  { label: "In arrivo",      value: "coming-soon",        param: "in-arrivo" },
  { label: "In affitto",     value: "for-rent",           param: "in-affitto" },
];

/** Cities appear as a filter only once the portfolio is big enough to need one. */
const CITY_FILTER_MIN_PROJECTS = 7;

function cityOf(location: string): string {
  return location.split(",")[0].trim();
}

function FilterBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
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

export default function ProgettiFilters({ projects }: { projects: ProjectSummary[] }) {
  const [category, setCategory] = useState<FilterCategory>("all");
  const [status,   setStatus]   = useState<FilterStatus>("all");
  const [city,     setCity]     = useState<string>("");

  // Filters live in the URL (shareable, back button works). Read once after
  // mount so the full grid is still server-rendered for search engines.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = catFilters.find((f) => f.param && f.param === params.get("tipo"));
    const st  = statusFilters.find((f) => f.param && f.param === params.get("stato"));
    if (cat) setCategory(cat.value);
    if (st) setStatus(st.value);
    if (params.get("citta")) setCity(params.get("citta")!);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    const cat = catFilters.find((f) => f.value === category)?.param;
    const st  = statusFilters.find((f) => f.value === status)?.param;
    if (cat) params.set("tipo", cat);
    if (st) params.set("stato", st);
    if (city) params.set("citta", city);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [category, status, city]);

  // Hide filter values no project uses: empty filters make the site look unfinished.
  const usedCategories = useMemo(() => new Set(projects.map((p) => p.category)), [projects]);
  const usedStatuses   = useMemo(() => new Set(projects.map((p) => p.status)), [projects]);
  const cities = useMemo(
    () => [...new Set(projects.map((p) => cityOf(p.location)))].sort((a, b) => a.localeCompare(b, "it")),
    [projects]
  );
  const visibleCats   = catFilters.filter((f) => f.value === "all" || usedCategories.has(f.value as ProjectCategory));
  const visibleStatus = statusFilters.filter((f) => f.value === "all" || usedStatuses.has(f.value as ProjectStatus));
  const showCity = projects.length >= CITY_FILTER_MIN_PROJECTS && cities.length > 1;

  const filtered = projects
    .filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (status   === "all" || p.status   === status) &&
        (!city || cityOf(p.location) === city)
    )
    // Projects with something still on the market come first.
    .sort((a, b) => Number(b.units.available > 0) - Number(a.units.available > 0));

  const resetFilters = () => {
    setCategory("all");
    setStatus("all");
    setCity("");
  };

  return (
    <>
      {/* Filters */}
      <section className="sticky top-[72px] z-30 bg-white border-b border-border-warm shadow-sm">
        <div className="container-custom py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {visibleCats.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1 lg:pb-0">
                <span className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mr-1 shrink-0">Tipo</span>
                {visibleCats.map((f) => (
                  <FilterBtn key={f.value} active={category === f.value} onClick={() => setCategory(f.value)}>
                    {f.label}
                  </FilterBtn>
                ))}
              </div>
            )}
            {visibleStatus.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1 lg:pb-0">
                <span className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mr-1 shrink-0">Stato</span>
                {visibleStatus.map((f) => (
                  <FilterBtn key={f.value} active={status === f.value} onClick={() => setStatus(f.value)}>
                    {f.label}
                  </FilterBtn>
                ))}
              </div>
            )}
            {showCity && (
              <label className="flex items-center gap-2">
                <span className="font-sans text-[10px] tracking-widest uppercase text-mid-gray">Città</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="font-sans text-xs border border-border-warm px-3 py-2 bg-white focus:outline-none focus:border-crg-red"
                >
                  <option value="">Tutte</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-cream">
        <div className="container-custom">
          {projects.length === 0 ? (
            <div className="py-24 text-center max-w-md mx-auto">
              <p className="font-heading text-2xl font-bold text-charcoal mb-4">
                Nuovi progetti in arrivo
              </p>
              <p className="font-sans text-sm text-mid-gray leading-relaxed">
                Stiamo preparando le prossime iniziative. Contattaci per sapere in anteprima dove e quando partiranno.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-heading text-2xl font-bold text-charcoal mb-4">
                Nessun progetto con questi filtri
              </p>
              <button type="button" onClick={resetFilters} className="btn-outline">
                Mostra tutti i progetti
              </button>
            </div>
          ) : (
            <>
              <p className="font-sans text-xs text-mid-gray mb-8" aria-live="polite">
                {filtered.length} progett{filtered.length === 1 ? "o" : "i"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
