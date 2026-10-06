import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import MessagingForm from "@/components/admin/projects/MessagingForm";
import { countUnits } from "@/lib/projects/derive";
import type { ProjectCategory, ProjectStatus, UnitStatus } from "@/lib/types/project";

export default async function ProjectMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  const { expectedDelivery: _d, expectedDeliveryLabel: _l, ...messaging } = project.messaging;

  return (
    <MessagingForm
      projectId={id}
      initial={messaging}
      category={project.category as ProjectCategory}
      status={project.status as ProjectStatus}
      counts={countUnits(project.units.map((u) => ({ status: u.status as UnitStatus })))}
      latestUpdate={project.updates.find((u) => u.isPublic)?.publishedOn ?? null}
    />
  );
}
