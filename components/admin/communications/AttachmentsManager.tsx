"use client";

import { useState } from "react";
import { Plus, X, FileText } from "lucide-react";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { addCommunicationAttachment, removeCommunicationAttachment } from "@/app/admin/(protected)/comunicazioni/actions";
import type { MediaLibraryItem } from "@/lib/types/media";

interface Attachment {
  id: string;
  media: { id: string; url: string; original_filename: string; kind: string } | null;
}

export default function AttachmentsManager({
  communicationId,
  initialItems,
}: {
  communicationId: string;
  initialItems: Attachment[];
}) {
  const [items, setItems] = useState(initialItems);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = async (media: MediaLibraryItem) => {
    const { id } = await addCommunicationAttachment(communicationId, media.id, items.length);
    setItems((prev) => [...prev, { id, media: { id: media.id, url: media.url, original_filename: media.original_filename, kind: media.kind } }]);
  };

  const handleRemove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await removeCommunicationAttachment(id);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Allegati</h2>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-crg-red hover:text-crg-red-dark"
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi allegato
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nessun allegato.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
              {item.media?.kind === "image" ? (
                <img src={item.media.url} alt={item.media.original_filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 px-2 text-center">
                  <FileText className="w-5 h-5" />
                  <span className="text-[10px] truncate w-full">{item.media?.original_filename}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <MediaLibraryModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleSelect} />
    </div>
  );
}
