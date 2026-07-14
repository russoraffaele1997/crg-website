"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { PalazzoRueSpotlightContent } from "@/lib/data/site-content";

export default function PalazzoRueSection({ content }: { content: PalazzoRueSpotlightContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

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
            <span className="section-label block mb-6">{content.eyebrow}</span>
            <h2 className="font-heading font-bold text-[46px] md:text-[58px] text-charcoal leading-[1.04] mb-6">
              {content.titleLine1}
              <br />
              <span className="text-crg-red">{content.titleLine2}</span>
            </h2>
            <p className="font-sans text-[15px] text-mid-gray leading-relaxed mb-4 max-w-md">
              {content.paragraph1}
            </p>
            <p className="font-sans text-[15px] text-mid-gray leading-relaxed mb-10 max-w-md">
              {content.paragraph2}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={content.ctaPrimaryHref} className="btn-primary">
                {content.ctaPrimaryLabel}
              </Link>
              <Link href="/contatti" className="btn-outline">
                {content.ctaSecondaryLabel}
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
                  {content.badge}
                </p>

                <div className="grid grid-cols-2 gap-px bg-white/8">
                  {content.specs.map((s, i) => (
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
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-sans text-xs text-white/40">
                    {content.availabilityLabel}
                  </span>
                  <span className="ml-auto font-sans text-[10px] tracking-wider uppercase text-mid-gray">
                    {content.availabilityNote}
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
