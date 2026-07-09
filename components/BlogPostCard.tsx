import Link from "next/link";
import ClientImage from "./ClientImage";
import type { BlogPostListItem } from "@/lib/data/blog";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

export default function BlogPostCard({ post }: { post: BlogPostListItem }) {
  return (
    <article className="group bg-white border border-border-warm hover:shadow-lg transition-all duration-500 flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3]">
        <ClientImage
          src={post.coverImage ?? ""}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          fallbackClass="w-full h-full bg-gradient-to-br from-stone-400 to-stone-600"
        />
        {post.category && (
          <span className="absolute top-4 left-4 font-sans text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 bg-white/95 text-charcoal border border-border-warm">
            {post.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-7">
        <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-mid-gray mb-3">
          {formatDate(post.publishedAt)}
          {post.authorName ? ` · ${post.authorName}` : ""}
        </span>
        <h3 className="font-heading text-xl font-bold text-charcoal mb-3 group-hover:text-crg-red transition-colors duration-300">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="font-sans text-sm text-mid-gray leading-relaxed flex-1 mb-6">
            {post.excerpt}
          </p>
        )}
        <Link
          href={`/blog/${post.slug}`}
          className="font-sans text-xs tracking-[0.25em] uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-crg-red hover:border-crg-red transition-colors duration-300 self-start"
        >
          Leggi →
        </Link>
      </div>
    </article>
  );
}
