import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import DocumentsManager from "@/components/admin/projects/DocumentsManager";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <DocumentsManager
      projectId={id}
      initialItems={project.documents
        .filter((d) => d.media)
        .map((d) => ({
          id: d.id,
          category: d.category as "capitolato" | "brochure" | "planimetrie" | "energetica" | "box" | "altro",
          title: d.title,
          requiresContact: d.requiresContact,
          isActive: d.isActive,
          filename: d.media!.original_filename,
          url: d.media!.url,
        }))}
    />
  );
}
