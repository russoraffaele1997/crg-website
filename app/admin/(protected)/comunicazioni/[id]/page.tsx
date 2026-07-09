import { notFound } from "next/navigation";
import { getAdminCommunicationById } from "@/lib/admin/data/communications";
import { getCommunicationCategories } from "@/lib/data/communications";
import CommunicationForm from "@/components/admin/communications/CommunicationForm";
import AttachmentsManager from "@/components/admin/communications/AttachmentsManager";

export default async function EditComunicazionePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [comm, categories] = await Promise.all([getAdminCommunicationById(id), getCommunicationCategories()]);
  if (!comm) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">{comm.title}</h1>
      </div>

      <CommunicationForm
        mode="edit"
        communicationId={id}
        categories={categories}
        initial={{
          slug: comm.slug,
          title: comm.title,
          subtitle: comm.subtitle,
          excerpt: comm.excerpt,
          body: comm.body,
          categoryId: comm.categoryId,
          isFeatured: comm.isFeatured,
          publishStatus: comm.publishStatus as "draft" | "published" | "archived",
          publishedAt: comm.publishedAt,
          coverImage: comm.coverImage
            ? {
                id: comm.coverImage.id,
                url: comm.coverImage.url,
                original_filename: comm.coverImage.original_filename,
                kind: comm.coverImage.kind as "image" | "video" | "pdf" | "document",
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

      <div className="mt-12 pt-8 border-t border-slate-200">
        <AttachmentsManager
          communicationId={id}
          initialItems={comm.attachments.map((a) => ({
            id: a.id,
            media: a.media ? { id: a.media.id, url: a.media.url, original_filename: a.media.original_filename, kind: a.media.kind } : null,
          }))}
        />
      </div>
    </div>
  );
}
