import type { Metadata } from "next";
import { getBlogPosts, getBlogCategories } from "@/lib/data/blog";
import BlogFilters from "./BlogFilters";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — CRG | Crafted Residential Group",
  description: "Approfondimenti, novità e guide sul mondo dello sviluppo immobiliare firmati CRG.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getBlogPosts(), getBlogCategories()]);

  return (
    <>
      <section className="pt-40 pb-20 bg-charcoal">
        <div className="container-custom">
          <span className="section-label block mb-6">Blog</span>
          <h1 className="section-title-light max-w-2xl">Approfondimenti e novità</h1>
          <p className="font-sans text-sm text-white/35 mt-4 max-w-xl leading-relaxed">
            Guide, novità di settore e aggiornamenti dal mondo CRG.
          </p>
        </div>
      </section>

      <BlogFilters posts={posts} categories={categories} />
    </>
  );
}
