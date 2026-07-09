import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjects, getProjectBySlug } from "@/lib/data/projects";
import { getEntitySeoBySlug } from "@/lib/data/seo";
import { buildMetadata } from "@/lib/seo/build-metadata";
import ProjectDetailClient from "./ProjectDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, seo] = await Promise.all([getProjectBySlug(slug), getEntitySeoBySlug("projects", slug)]);
  if (!project) return {};
  return buildMetadata(seo, {
    title: `${project.title} — CRG | Crafted Residential Group`,
    description: project.shortDescription,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetailClient project={project} />;
}
