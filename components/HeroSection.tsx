"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { HeroContent } from "@/lib/data/site-content";
import type { Project } from "@/lib/types/project";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.25, 0, 0, 1] } },
};

export default function HeroSection({ content, projects }: { content: HeroContent; projects: Project[] }) {
  // Avoid listing the same project the primary CTA already links to.
  const otherProjects = projects.filter(
    (p) => `/progetti/${p.slug}` !== content.ctaPrimaryHref
  );

  return (
    <section className="relative min-h-screen bg-charcoal flex items-center justify-center overflow-hidden">
      {/* Fine grid texture */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200,16,46,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,16,46,1) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Radial red glow (bottom center) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-crg-red/5 blur-3xl rounded-full" />

      <div className="container-custom relative z-10 text-center pt-36 pb-32">
        <motion.div variants={container} initial="hidden" animate="show">

          <motion.div variants={item} className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-8 bg-crg-red" />
            <span className="font-sans text-[10px] tracking-[0.5em] uppercase text-crg-red">
              {content.eyebrow}
            </span>
            <div className="h-px w-8 bg-crg-red" />
          </motion.div>

          <motion.h1
            variants={item}
            className="font-heading font-bold text-[46px] md:text-[70px] lg:text-[84px] text-white leading-[1.04] mb-6 max-w-4xl mx-auto"
          >
            {content.titleLine1}
            <br />
            <span className="text-crg-red">{content.titleLine2}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="font-sans text-[11px] tracking-[0.28em] uppercase text-white/35 mb-3"
          >
            {content.tagline}
          </motion.p>

          <motion.p
            variants={item}
            className="font-sans text-[15px] text-white/40 max-w-xl mx-auto mb-14 leading-relaxed mt-6"
          >
            {content.body}
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href={content.ctaPrimaryHref} className="btn-primary">
              {content.ctaPrimaryLabel}
            </Link>
            <Link href={content.ctaSecondaryHref} className="btn-outline-light">
              {content.ctaSecondaryLabel}
            </Link>
          </motion.div>

          {/* Other projects */}
          {otherProjects.length > 0 && (
            <motion.div
              variants={item}
              className="mt-14 flex flex-wrap items-center justify-center gap-3"
            >
              {otherProjects.map((project) => {
                const available = project.units.filter((u) => u.status === "available").length;
                return (
                  <Link
                    key={project.id}
                    href={`/progetti/${project.slug}`}
                    className="flex items-center gap-2 font-sans text-[11px] tracking-[0.15em] uppercase text-white/60 hover:text-white border border-white/15 hover:border-white/40 rounded-full px-5 py-2.5 transition-colors"
                  >
                    Scopri {project.title}
                    {available > 0 && (
                      <span className="text-crg-red font-semibold">
                        {available} disponibil{available === 1 ? "e" : "i"}
                      </span>
                    )}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2"
      >
        <motion.svg
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 text-white/15"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
