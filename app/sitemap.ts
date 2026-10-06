import type { MetadataRoute } from "next";
import { getProjectSummaries } from "@/lib/data/projects";
import { getCommunications } from "@/lib/data/communications";
import { getBlogPosts } from "@/lib/data/blog";

import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, communications, blogPosts] = await Promise.all([
    getProjectSummaries(),
    getCommunications(),
    getBlogPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/chi-siamo`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/progetti`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/comunicazioni`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contatti`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/progetti/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const communicationRoutes: MetadataRoute.Sitemap = communications.map((c) => ({
    url: `${SITE_URL}/comunicazioni/${c.slug}`,
    lastModified: c.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...communicationRoutes, ...blogRoutes];
}
