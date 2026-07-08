import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import TimelineManager from "@/components/admin/projects/TimelineManager";

export default async function ProjectTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <TimelineManager
      projectId={id}
      initialItems={project.timeline.map((t) => ({
        id: t.id,
        label: t.label,
        dateLabel: t.dateLabel,
        completed: t.completed,
      }))}
    />
  );
}
