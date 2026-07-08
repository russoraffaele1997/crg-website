import { getMediaFolders, getMediaItems } from "@/lib/admin/data/media";
import MediaLibraryManager from "@/components/admin/media/MediaLibraryManager";

export default async function MediaLibraryAdminPage() {
  const [folders, { items }] = await Promise.all([getMediaFolders(), getMediaItems()]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Media Library</h1>
        <p className="text-sm text-slate-500 mt-1">Carica, organizza e riusa immagini, video e documenti.</p>
      </div>
      <MediaLibraryManager initialFolders={folders} initialItems={items} />
    </div>
  );
}
