"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { WhyCrgContent } from "@/lib/data/site-content";

export default function WhyCRGSection({ content }: { content: WhyCrgContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 lg:py-36 bg-anthracite" ref={ref}>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:col-span-4"
          >
            <span className="section-label block mb-4">{content.eyebrow}</span>
            <h2 className="section-title-light mb-6">
              {content.title}
            </h2>
            <p className="font-sans text-sm text-white/35 leading-relaxed">
              {content.intro}
            </p>
          </motion.div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/8">
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                className="bg-anthracite p-8 group hover:bg-charcoal transition-colors duration-300"
              >
                <div className="w-8 h-[2px] bg-crg-red mb-6 group-hover:w-14 transition-all duration-500" />
                <h3 className="font-heading text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm text-white/35 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
