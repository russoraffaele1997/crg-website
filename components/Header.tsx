"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/lib/types/project";

export default function Header({ projects }: { projects: Project[] }) {
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [mobileProjects, setMobileProjects] = useState(false);
  const pathname = usePathname();

  // Header is "light" (dark bg) only on homepage before scroll
  const isLight = !scrolled && pathname === "/" && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navBase =
    "font-sans text-[11px] tracking-[0.22em] uppercase transition-colors duration-300";
  const navColor = isLight
    ? "text-white/70 hover:text-white"
    : "text-charcoal hover:text-crg-red";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen
          ? "bg-white border-b border-border-warm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-[72px]">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center group">
            <div className={`
              transition-all duration-300 rounded px-2 py-1.5 -mx-2 -my-1.5
              ${isLight ? "hover:bg-white/10" : "hover:bg-black/5"}
            `}>
              <Image
                src="/logo-crg.png"
                alt="CRG | Crafted Residential Group"
                width={160}
                height={58}
                className="h-12 w-auto transition-opacity duration-300 group-hover:opacity-80"
                priority
              />
            </div>
          </Link>

          {/* ── Desktop navigation ───────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/chi-siamo" className={`${navBase} ${navColor}`}>
              Chi siamo
            </Link>

            {/* Progetti with dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                className={`${navBase} ${navColor} flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer`}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
              >
                Progetti
                <motion.svg
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-2.5 h-2.5"
                  fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full right-0 mt-3 w-72 bg-white border border-border-warm shadow-2xl"
                  >
                    <div className="px-5 py-3 border-b border-border-warm">
                      <Link
                        href="/progetti"
                        className="font-sans text-[10px] tracking-[0.25em] uppercase text-mid-gray hover:text-crg-red transition-colors"
                      >
                        Tutti i progetti →
                      </Link>
                    </div>
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/progetti/${project.slug}`}
                        className="flex flex-col px-5 py-3.5 hover:bg-crg-red-light transition-colors group border-b border-border-warm/50 last:border-b-0"
                      >
                        <span className="font-heading text-sm font-semibold text-charcoal group-hover:text-crg-red transition-colors">
                          {project.title}
                        </span>
                        <span className="font-sans text-[10px] text-mid-gray mt-0.5">
                          {project.location} · {project.statusLabel}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/contatti" className={`${navBase} ${navColor}`}>
              Contatti
            </Link>
          </nav>

          {/* ── Mobile hamburger ─────────────────────────────────────── */}
          <button
            className="md:hidden p-2 flex flex-col gap-[5px]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={
                  i === 0
                    ? mobileOpen ? { rotate: 45, y: 7 }  : { rotate: 0, y: 0 }
                    : i === 1
                    ? mobileOpen ? { opacity: 0 }         : { opacity: 1 }
                    : mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.25 }}
                className={`block w-5 h-px transition-colors ${
                  isLight ? "bg-white" : "bg-charcoal"
                }`}
              />
            ))}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-border-warm bg-white"
          >
            <nav className="container-custom py-6 flex flex-col">
              <Link
                href="/chi-siamo"
                className="font-sans text-xs tracking-[0.22em] uppercase text-charcoal py-4 border-b border-border-warm hover:text-crg-red transition-colors"
              >
                Chi siamo
              </Link>

              <div className="border-b border-border-warm">
                <button
                  onClick={() => setMobileProjects((v) => !v)}
                  className="w-full font-sans text-xs tracking-[0.22em] uppercase text-charcoal py-4 flex items-center justify-between hover:text-crg-red transition-colors bg-transparent border-none"
                >
                  Progetti
                  <motion.svg
                    animate={{ rotate: mobileProjects ? 180 : 0 }}
                    className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {mobileProjects && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pb-3"
                    >
                      <Link
                        href="/progetti"
                        className="block font-sans text-[10px] tracking-widest uppercase text-mid-gray px-4 py-2 hover:text-crg-red transition-colors"
                      >
                        Tutti i progetti →
                      </Link>
                      {projects.map((p) => (
                        <Link
                          key={p.id}
                          href={`/progetti/${p.slug}`}
                          className="block px-4 py-2 hover:text-crg-red transition-colors"
                        >
                          <span className="font-heading text-sm font-semibold text-charcoal">{p.title}</span>
                          <span className="font-sans text-[10px] text-mid-gray ml-2">{p.location}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/contatti"
                className="font-sans text-xs tracking-[0.22em] uppercase text-charcoal py-4 hover:text-crg-red transition-colors"
              >
                Contatti
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
