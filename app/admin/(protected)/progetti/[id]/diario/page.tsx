import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import UpdatesManager from "@/components/admin/projects/UpdatesManager";

export default async function ProjectDiaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return <UpdatesManager projectId={id} initialItems={project.updates} />;
}
