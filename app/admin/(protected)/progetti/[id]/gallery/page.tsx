import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import GalleryManager from "@/components/admin/projects/GalleryManager";

export default async function ProjectGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <GalleryManager
      projectId={id}
      initialItems={project.gallery.map((g) => ({
        id: g.id,
        media: g.media ? { id: g.media.id, url: g.media.url, original_filename: g.media.original_filename } : null,
      }))}
    />
  );
}
