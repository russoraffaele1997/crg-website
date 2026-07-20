"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Upload,
  Trash2,
  RefreshCw,
  Folder as FolderIcon,
  FolderPlus,
  Loader2,
  X,
} from "lucide-react";
import { fetchMediaFolders, fetchMediaItems, createMediaFolder, deleteMediaFolder, deleteMediaItem, replaceMediaFile } from "@/lib/actions/media";
import { uploadFileToMedia } from "@/lib/admin/upload-file";
import { compressImageIfNeeded } from "@/lib/utils/compress-image";
import { createClient } from "@/lib/supabase/browser";
import type { MediaLibraryItem, MediaKind } from "@/lib/types/media";
import type { MediaFolder } from "@/lib/admin/data/media";

const kindTabs: { value: MediaKind | "all"; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "image", label: "Immagini" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Documenti" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaLibraryManager({
  initialFolders,
  initialItems,
}: {
  initialFolders: MediaFolder[];
  initialItems: MediaLibraryItem[];
}) {
  const [folders, setFolders] = useState(initialFolders);
  const [items, setItems] = useState(initialItems);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetId = useRef<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    fetchMediaItems({
      folderId: folderId ?? undefined,
      kind: kind === "all" ? undefined : kind,
      search: search || undefined,
    })
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, [folderId, kind, search]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleUploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        await uploadFileToMedia(file, folderId);
      }
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload non riuscito.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleReplace = async (file: File) => {
    const id = replaceTargetId.current;
    if (!id) return;
    setUploading(true);
    setError("");
    try {
      const processed = await compressImageIfNeeded(file);
      const path = `general/${crypto.randomUUID()}-${file.name.toLowerCase().replace(/[^a-z0-9.\-]+/g, "-")}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("media").upload(path, processed);
      if (uploadError) throw new Error(uploadError.message);

      const kindValue: MediaKind = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : file.type === "application/pdf"
            ? "pdf"
            : "document";
      await replaceMediaFile(id, {
        storagePath: path,
        kind: kindValue,
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: processed.size,
      });
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sostituzione non riuscita.");
    } finally {
      setUploading(false);
      replaceTargetId.current = null;
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo file?")) return;
    try {
      await deleteMediaItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eliminazione non riuscita.");
    }
  };

  const handleNewFolder = async () => {
    const name = prompt("Nome della nuova cartella:");
    if (!name?.trim()) return;
    const id = await createMediaFolder(name.trim(), null);
    setFolders((prev) => [...prev, { id, name: name.trim(), parentId: null }].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Eliminare questa cartella? I file al suo interno non verranno eliminati.")) return;
    await deleteMediaFolder(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (folderId === id) setFolderId(null);
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-52 shrink-0">
        <button
          type="button"
          onClick={() => setFolderId(null)}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm mb-1 ${
            folderId === null ? "bg-crg-red-light text-crg-red font-medium" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FolderIcon className="w-4 h-4" />
          Tutti i file
        </button>
        {folders.map((f) => (
          <div
            key={f.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 cursor-pointer ${
              folderId === f.id ? "bg-crg-red-light text-crg-red font-medium" : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setFolderId(f.id)}
          >
            <FolderIcon className="w-4 h-4 shrink-0" />
            <span className="flex-1 truncate">{f.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(f.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleNewFolder}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 mt-2"
        >
          <FolderPlus className="w-4 h-4" />
          Nuova cartella
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per nome file..."
              className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-crg-red"
            />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Carica file
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
          />
          <input
            ref={replaceInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleReplace(file);
            }}
          />
        </div>

        <div className="flex gap-2 mb-5">
          {kindTabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setKind(t.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                kind === t.value
                  ? "bg-slate-900 text-white border-slate-900"
                  : "text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) handleUploadFiles(e.dataTransfer.files);
          }}
          className={`rounded-xl border-2 border-dashed transition-colors p-4 min-h-[240px] ${
            dragOver ? "border-crg-red bg-crg-red-light" : "border-transparent"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-16">
              Nessun file. Trascina qui un file oppure usa &ldquo;Carica file&rdquo;.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {items.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    {item.kind === "image" ? (
                      <img src={item.url} alt={item.original_filename} className="w-full h-full object-cover" />
                    ) : item.kind === "video" ? (
                      <video src={item.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 px-2 text-center">
                        {item.original_filename}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          replaceTargetId.current = item.id;
                          replaceInputRef.current?.click();
                        }}
                        className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full"
                        aria-label="Sostituisci"
                        title="Sostituisci"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="bg-white/90 hover:bg-white text-red-600 p-2 rounded-full"
                        aria-label="Elimina"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-1.5">{item.original_filename}</p>
                  <p className="text-[10px] text-slate-400">{formatSize(item.size_bytes)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
