import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import DeliveryForm from "@/components/admin/projects/DeliveryForm";
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
    <>
      <DeliveryForm
        projectId={id}
        initialDate={project.messaging.expectedDelivery}
        initialLabel={project.messaging.expectedDeliveryLabel}
      />
      <TimelineManager
        projectId={id}
        initialItems={project.timeline.map((t) => ({
          id: t.id,
          label: t.label,
          dateLabel: t.dateLabel,
          sortableDate: t.sortableDate,
          description: t.description,
          weight: t.weight,
          completed: t.completed,
          images: t.images,
        }))}
      />
    </>
  );
}
