"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search, Upload, Folder, Loader2, Check } from "lucide-react";
import { fetchMediaFolders, fetchMediaItems } from "@/lib/actions/media";
import { uploadFileToMedia } from "@/lib/admin/upload-file";
import type { MediaLibraryItem, MediaKind } from "@/lib/types/media";
import type { MediaFolder } from "@/lib/admin/data/media";

const acceptByKind: Record<MediaKind, string> = {
  image: "image/*",
  video: "video/*",
  pdf: "application/pdf",
  document: "",
};

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  kindFilter,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaLibraryItem) => void;
  kindFilter?: MediaKind | MediaKind[];
}) {
  const [tab, setTab] = useState<"browse" | "upload">("browse");
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    fetchMediaFolders().then(setFolders);
  }, [open]);

  useEffect(() => {
    if (!open || tab !== "browse") return;
    setLoading(true);
    fetchMediaItems({ folderId: folderId ?? undefined, kind: kindFilter, search: search || undefined })
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, [open, tab, folderId, search, kindFilter]);

  if (!open) return null;

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const media = await uploadFileToMedia(file, folderId);
      onSelect(media);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload non riuscito.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Media Library</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-3 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab("browse")}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === "browse" ? "border-crg-red text-crg-red" : "border-transparent text-slate-500"
            }`}
          >
            Libreria
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === "upload" ? "border-crg-red text-crg-red" : "border-transparent text-slate-500"
            }`}
          >
            Carica nuovo
          </button>
        </div>

        {tab === "browse" ? (
          <>
            <div className="flex gap-2 px-5 py-3 border-b border-slate-100">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per nome file..."
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-crg-red"
                />
              </div>
              <select
                value={folderId ?? ""}
                onChange={(e) => setFolderId(e.target.value || null)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-crg-red"
              >
                <option value="">Tutte le cartelle</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-16">Nessun file trovato.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden hover:border-crg-red transition-colors"
                    >
                      {item.kind === "image" ? (
                        <img src={item.url} alt={item.original_filename} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-[10px] text-slate-500 px-2 text-center">
                          {item.original_filename}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10">
            <Folder className="w-4 h-4 text-slate-400 self-start" />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center gap-2 h-40 w-full max-w-sm rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-crg-red hover:text-crg-red transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              <span className="text-sm">{uploading ? "Caricamento e compressione..." : "Scegli un file"}</span>
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input
              ref={inputRef}
              type="file"
              accept={
                kindFilter
                  ? (Array.isArray(kindFilter) ? kindFilter : [kindFilter]).map((k) => acceptByKind[k]).join(",")
                  : undefined
              }
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
