"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Project } from "@/lib/types/project";
import type { FeaturedProjectsContent } from "@/lib/data/site-content";
import ProjectCard from "./ProjectCard";

export default function FeaturedProjects({
  featured,
  content,
}: {
  featured: Project[];
  content: FeaturedProjectsContent;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const titleLines = content.title.split("\n");

  return (
    <section id="progetti" className="py-28 lg:py-36 bg-white scroll-mt-24" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <span className="section-label block mb-4">{content.eyebrow}</span>
            <h2 className="section-title">
              {titleLines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
            {content.tagline && (
              <p className="font-sans text-base text-mid-gray mt-4 max-w-md">{content.tagline}</p>
            )}
          </div>
          <Link
            href="/progetti"
            className="font-sans text-xs tracking-[0.25em] uppercase text-mid-gray hover:text-crg-red transition-colors self-start md:self-auto border-b border-mid-gray hover:border-crg-red pb-0.5"
          >
            Tutti i progetti →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
