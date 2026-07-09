import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts, getRelatedPosts } from "@/lib/data/blog";
import ClientImage from "@/components/ClientImage";
import BlogPostCard from "@/components/BlogPostCard";
import BlockRenderer from "@/components/blog/BlockRenderer";
import ShareButtons from "./ShareButtons";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoMetaTitle || `${post.title} — CRG | Crafted Residential Group`,
    description: post.seoMetaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.seoMetaTitle || post.title,
      description: post.seoMetaDescription || post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.category?.id ?? null);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[380px] flex items-end bg-charcoal overflow-hidden">
        <ClientImage
          src={post.coverImage ?? ""}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          fallbackClass="absolute inset-0 w-full h-full bg-gradient-to-br from-stone-400 to-stone-600"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-crg-red" />

        <div className="container-custom relative z-10 pb-14">
          <div className="flex flex-wrap gap-3 mb-5">
            {post.category && (
              <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-crg-red">{post.category.name}</span>
            )}
            <span className="text-white/30">·</span>
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/50">
              {formatDate(post.publishedAt)}
              {post.authorName ? ` · ${post.authorName}` : ""}
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-5xl text-white mb-3 leading-tight max-w-3xl">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-warm">
        <div className="container-custom py-4">
          <nav className="font-sans text-xs text-mid-gray flex items-center gap-2">
            <Link href="/" className="hover:text-crg-red transition-colors">Home</Link>
            <span>›</span>
            <Link href="/blog" className="hover:text-crg-red transition-colors">Blog</Link>
            <span>›</span>
            <span className="text-charcoal">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Body */}
      <section className="py-16 bg-cream">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <BlockRenderer content={post.contentJson} />

            {post.gallery.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border-warm">
                <h2 className="font-heading text-lg font-bold text-charcoal mb-5">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {post.gallery.map((src, i) => (
                    <div key={i} className="aspect-square overflow-hidden">
                      <ClientImage src={src} alt={`${post.title} — foto ${i + 1}`} className="w-full h-full object-cover" fallbackClass="w-full h-full bg-stone-200" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag.id} className="font-sans text-[10px] tracking-widest uppercase px-3 py-1.5 border border-border-warm text-mid-gray">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-border-warm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <ShareButtons title={post.title} />
              <Link
                href="/blog"
                className="font-sans text-xs tracking-[0.25em] uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-crg-red hover:border-crg-red transition-colors"
              >
                ← Tutti gli articoli
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 bg-white border-t border-border-warm">
          <div className="container-custom">
            <span className="section-label block mb-4">Articoli correlati</span>
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-10">Continua a leggere</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-warm">
              {related.map((p) => (
                <BlogPostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
