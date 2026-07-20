"use client";

import { useEffect, useState } from "react";
import { X, Plus, FileText, Loader2 } from "lucide-react";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { fetchUnitDocuments, addUnitDocument, removeUnitDocument } from "@/app/admin/(protected)/progetti/actions";
import type { UnitDocument } from "@/lib/admin/data/units";
import type { MediaLibraryItem } from "@/lib/types/media";

function DocSection({
  title,
  docType,
  items,
  onAdd,
  onRemove,
}: {
  title: string;
  docType: "floorplan" | "photo";
  items: UnitDocument[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-medium text-crg-red hover:text-crg-red-dark"
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">Nessun file.</p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {items
            .filter((i) => i.docType === docType)
            .map((doc) => (
              <div key={doc.id} className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                {doc.media?.kind === "image" ? (
                  <img src={doc.media.url} alt={doc.media.original_filename} className="w-full h-full object-cover" />
                ) : doc.media?.kind === "video" ? (
                  <video src={doc.media.url} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 px-2 text-center">
                    <FileText className="w-5 h-5" />
                    <span className="text-[9px] truncate w-full">{doc.media?.original_filename}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(doc.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default function UnitDocumentsPanel({
  unitId,
  unitName,
  open,
  onClose,
}: {
  unitId: string;
  unitName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<UnitDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerFor, setPickerFor] = useState<"floorplan" | "photo" | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchUnitDocuments(unitId)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [open, unitId]);

  if (!open) return null;

  const handleSelect = async (media: MediaLibraryItem) => {
    if (!pickerFor) return;
    await addUnitDocument(unitId, media.id, pickerFor, items.length);
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), docType: pickerFor, orderIndex: prev.length, media: { id: media.id, url: media.url, original_filename: media.original_filename, kind: media.kind } },
    ]);
    setPickerFor(null);
  };

  const handleRemove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await removeUnitDocument(id);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Planimetria e foto</h2>
            <p className="text-xs text-slate-500 mt-0.5">{unitName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            <DocSection
              title="Planimetria"
              docType="floorplan"
              items={items}
              onAdd={() => setPickerFor("floorplan")}
              onRemove={handleRemove}
            />
            <DocSection
              title="Foto appartamento (anteprima nel popup)"
              docType="photo"
              items={items}
              onAdd={() => setPickerFor("photo")}
              onRemove={handleRemove}
            />
          </>
        )}
      </div>

      <MediaLibraryModal open={pickerFor !== null} onClose={() => setPickerFor(null)} onSelect={handleSelect} />
    </div>
  );
}
