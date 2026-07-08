import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import FeatureListManager from "@/components/admin/projects/FeatureListManager";

export default async function ProjectCaratteristichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
      <FeatureListManager
        projectId={id}
        kind="highlight"
        title="Punti di forza"
        initialItems={project.highlights.map((h) => ({ id: h.id, title: h.title }))}
      />
      <FeatureListManager
        projectId={id}
        kind="technical"
        title="Caratteristiche tecniche"
        initialItems={project.technicalFeatures.map((f) => ({ id: f.id, title: f.title }))}
      />
    </div>
  );
}
