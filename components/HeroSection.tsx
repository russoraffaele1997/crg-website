"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { HeroContent } from "@/lib/data/site-content";
import type { ProjectSummary } from "@/lib/types/project";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.25, 0, 0, 1] } },
};

export default function HeroSection({ content, projects }: { content: HeroContent; projects: ProjectSummary[] }) {
  return (
    <section className="relative min-h-screen bg-charcoal flex items-center justify-center overflow-hidden">
      {/* Background photo */}
      <Image
        src="/cantiere-crg.jpg"
        alt="Cantiere CRG"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark scrim for text legibility over the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/70 to-charcoal/90" />

      {/* Fine grid texture */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200,16,46,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,16,46,1) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Fade into the white construction animation right below */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white pointer-events-none" />

      {/* Radial red glow (bottom center) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-crg-red/10 blur-3xl rounded-full" />

      <div className="container-custom relative z-10 text-center pt-36 pb-32">
        <motion.div variants={container} initial="hidden" animate="show">

          <motion.div variants={item} className="flex items-center justify-center mb-8">
            <Image
              src="/logo-crg.png"
              alt="CRG | Crafted Residential Group"
              width={320}
              height={116}
              className="h-24 sm:h-28 w-auto brightness-0 invert"
              priority
            />
          </motion.div>

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
            className="font-sans text-[11px] tracking-[0.28em] uppercase text-white/45 mb-3"
          >
            {content.tagline}
          </motion.p>

          <motion.p
            variants={item}
            className="font-sans text-[15px] text-white/50 max-w-xl mx-auto mb-14 leading-relaxed mt-6"
          >
            {content.body}
          </motion.p>

          <motion.p
            variants={item}
            className="font-sans text-xs tracking-[0.1em] uppercase text-crg-red mb-6"
          >
            {content.urgencyText}
          </motion.p>

          {projects.length > 0 && (
            <motion.div variants={item}>
              <a href="#progetti" className="btn-primary px-14 py-5 text-sm tracking-[0.2em]">
                Scegli la tua prossima casa
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="font-sans text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-charcoal font-medium">
          Scorri per scoprire i nostri progetti
        </span>
        <motion.svg
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-5 text-crg-red"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
