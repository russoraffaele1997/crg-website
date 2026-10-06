import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import PartnersManager from "@/components/admin/projects/PartnersManager";

export default async function ProjectPartnersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <PartnersManager
      projectId={id}
      initialItems={project.partners.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        website: p.website,
        logo: p.logo ? { id: p.logo.id, url: p.logo.url } : null,
      }))}
    />
  );
}
