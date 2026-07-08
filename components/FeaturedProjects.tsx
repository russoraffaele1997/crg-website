"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Project } from "@/lib/types/project";
import ProjectCard from "./ProjectCard";

export default function FeaturedProjects({ featured }: { featured: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 lg:py-36 bg-cream" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <span className="section-label block mb-4">I nostri progetti</span>
            <h2 className="section-title">
              Sviluppi in corso
              <br />e disponibili
            </h2>
          </div>
          <Link
            href="/progetti"
            className="font-sans text-xs tracking-[0.25em] uppercase text-mid-gray hover:text-crg-red transition-colors self-start md:self-auto border-b border-mid-gray hover:border-crg-red pb-0.5"
          >
            Tutti i progetti →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-warm">
          {featured.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.12 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
