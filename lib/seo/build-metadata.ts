import type { Metadata } from "next";
import type { PageSeo } from "@/lib/data/seo";

/** Default share image (app/opengraph-image.jpg): page-level openGraph would otherwise drop it. */
const DEFAULT_SHARE_IMAGE = "/opengraph-image.jpg";

export function buildMetadata(
  seo: PageSeo | null,
  fallback: { title: string; description: string; image?: string }
): Metadata {
  const title = seo?.metaTitle || fallback.title;
  const description = seo?.metaDescription || fallback.description;
  const image = seo?.ogImage || fallback.image || DEFAULT_SHARE_IMAGE;

  return {
    title,
    description,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [image],
    },
    twitter: {
      card: (seo?.twitterCard as "summary" | "summary_large_image" | undefined) ?? "summary_large_image",
      images: [image],
    },
  };
}
