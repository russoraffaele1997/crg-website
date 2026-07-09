"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlogPostCard from "@/components/BlogPostCard";
import type { BlogPostListItem, BlogCategory } from "@/lib/data/blog";

export default function BlogFilters({
  posts,
  categories,
}: {
  posts: BlogPostListItem[];
  categories: BlogCategory[];
}) {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("all");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch = search.trim() ? p.title.toLowerCase().includes(search.trim().toLowerCase()) : true;
      const matchesCategory = categorySlug === "all" || p.category?.slug === categorySlug;
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, categorySlug]);

  return (
    <>
      <section className="sticky top-[72px] z-30 bg-white border-b border-border-warm shadow-sm">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCategorySlug("all")}
                className={`font-sans text-[11px] tracking-wider uppercase px-4 py-2 border transition-all duration-200 ${
                  categorySlug === "all" ? "bg-crg-red text-white border-crg-red" : "bg-transparent text-mid-gray border-border-warm hover:border-crg-red hover:text-crg-red"
                }`}
              >
                Tutti
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`font-sans text-[11px] tracking-wider uppercase px-4 py-2 border transition-all duration-200 ${
                    categorySlug === cat.slug ? "bg-crg-red text-white border-crg-red" : "bg-transparent text-mid-gray border-border-warm hover:border-crg-red hover:text-crg-red"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca articoli..."
              className="input-field max-w-xs"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="container-custom">
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-heading text-2xl font-bold text-mid-gray mb-4">Nessun articolo trovato</p>
              <p className="font-sans text-sm text-mid-gray/60">Modifica i filtri per visualizzare altri risultati.</p>
            </div>
          ) : (
            <>
              <p className="font-sans text-xs text-mid-gray mb-8">
                {filtered.length} articol{filtered.length === 1 ? "o" : "i"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-warm">
                <AnimatePresence>
                  {filtered.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <BlogPostCard post={post} />
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
