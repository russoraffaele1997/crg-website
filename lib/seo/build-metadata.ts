import type { Metadata } from "next";
import type { PageSeo } from "@/lib/data/seo";

export function buildMetadata(seo: PageSeo | null, fallback: { title: string; description: string }): Metadata {
  const title = seo?.metaTitle || fallback.title;
  const description = seo?.metaDescription || fallback.description;

  return {
    title,
    description,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
    twitter: {
      card: (seo?.twitterCard as "summary" | "summary_large_image" | undefined) ?? "summary_large_image",
    },
  };
}
