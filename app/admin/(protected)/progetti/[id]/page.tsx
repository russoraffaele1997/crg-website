import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/admin/data/projects";
import ProjectGeneralForm from "@/components/admin/projects/ProjectGeneralForm";

export default async function ProjectGeneralPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <ProjectGeneralForm
      mode="edit"
      projectId={id}
      initial={{
        slug: project.slug,
        title: project.title,
        location: project.location,
        category: project.category as "residential" | "commercial" | "industrial",
        status: project.status as "for-sale" | "under-construction" | "coming-soon" | "for-rent",
        statusLabel: project.statusLabel,
        shortDescription: project.shortDescription,
        description: project.description,
        isFeatured: project.isFeatured,
        featuredOrder: project.featuredOrder,
        isSpotlight: project.isSpotlight,
        spotlightSpecs: project.spotlightSpecs,
        publishStatus: project.publishStatus as "draft" | "published" | "archived",
        seoMetaTitle: project.seoMetaTitle,
        seoMetaDescription: project.seoMetaDescription,
        ogTitle: project.ogTitle,
        ogDescription: project.ogDescription,
        coverImage: project.coverImage
          ? {
              id: project.coverImage.id,
              url: project.coverImage.url,
              original_filename: project.coverImage.original_filename,
              kind: project.coverImage.kind,
              storage_path: "",
              bucket: "media",
              mime_type: "",
              size_bytes: 0,
              width: null,
              height: null,
              alt_text: null,
            }
          : null,
      }}
    />
  );
}
