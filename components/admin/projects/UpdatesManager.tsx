"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import PhotoStrip, { type PhotoItem } from "./PhotoStrip";
import {
  createProjectUpdate,
  updateProjectUpdate,
  deleteProjectUpdate,
  addUpdateImage,
  removeUpdateImage,
  type ProjectUpdateInput,
} from "@/app/admin/(protected)/progetti/actions";
import { todayIso } from "@/lib/projects/derive";

export interface UpdateItem {
  id: string;
  publishedOn: string;
  title: string;
  body: string;
  isPublic: boolean;
  images: PhotoItem[];
}

const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red";

function toInput(u: UpdateItem): ProjectUpdateInput {
  return { publishedOn: u.publishedOn, title: u.title, body: u.body, isPublic: u.isPublic };
}

export default function UpdatesManager({ projectId, initialItems }: { projectId: string; initialItems: UpdateItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<ProjectUpdateInput>({ publishedOn: todayIso(), title: "", body: "", isPublic: true });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    }
  };

  const edit = (id: string, changes: Partial<UpdateItem>) =>
    setItems((prev) => prev.map((u) => (u.id === id ? { ...u, ...changes } : u)));

  const save = (id: string, changes: Partial<UpdateItem> = {}) =>
    run(async () => {
      const item = items.find((u) => u.id === id);
      if (!item) return;
      edit(id, changes);
      await updateProjectUpdate(id, toInput({ ...item, ...changes }));
    });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      setAdding(true);
      try {
        const { id } = await createProjectUpdate(projectId, draft);
        setItems((prev) =>
          [{ id, ...draft, title: draft.title.trim(), body: draft.body.trim(), images: [] }, ...prev].sort((a, b) =>
            b.publishedOn.localeCompare(a.publishedOn)
          )
        );
        setDraft({ publishedOn: todayIso(), title: "", body: "", isPublic: true });
      } finally {
        setAdding(false);
      }
    });
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 mb-8 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Nuovo aggiornamento dal cantiere</h2>
        <p className="text-xs text-slate-500">Due righe e qualche foto bastano: sul sito compaiono nel &quot;Diario di cantiere&quot;, dal più recente.</p>
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
          <input type="date" required value={draft.publishedOn} onChange={(e) => setDraft((d) => ({ ...d, publishedOn: e.target.value }))} className={inputCls} aria-label="Data" />
          <input required value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Es. Completato il getto del secondo solaio" className={inputCls} aria-label="Titolo" />
        </div>
        <textarea rows={3} value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} placeholder="Racconta in breve cosa è successo (facoltativo)" className={`${inputCls} resize-y`} aria-label="Testo" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={draft.isPublic} onChange={(e) => setDraft((d) => ({ ...d, isPublic: e.target.checked }))} className="w-4 h-4 accent-crg-red" />
            Visibile sul sito
          </label>
          <button type="submit" disabled={adding || !draft.title.trim()} className="flex items-center gap-1.5 bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40">
            <Plus className="w-4 h-4" /> Pubblica
          </button>
        </div>
        <p className="text-xs text-slate-400">Le foto si aggiungono subito dopo, dall&apos;elenco qui sotto.</p>
      </form>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nessun aggiornamento ancora. Finché il diario è vuoto, la sezione non compare sul sito.</p>
      ) : (
        <div className="space-y-4">
          {items.map((u) => (
            <article key={u.id} className={`bg-white border rounded-xl p-5 ${u.isPublic ? "border-slate-200" : "border-dashed border-slate-300 opacity-80"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-3 items-center mb-3">
                <input type="date" value={u.publishedOn} onChange={(e) => save(u.id, { publishedOn: e.target.value })} className={inputCls} aria-label="Data" />
                <input value={u.title} onChange={(e) => edit(u.id, { title: e.target.value })} onBlur={() => save(u.id)} className={`${inputCls} font-medium`} aria-label="Titolo" />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => save(u.id, { isPublic: !u.isPublic })}
                    className="p-2 text-slate-500 hover:text-slate-900"
                    title={u.isPublic ? "Visibile: clicca per nascondere" : "Nascosto: clicca per pubblicare"}
                    aria-label={u.isPublic ? "Nascondi dal sito" : "Mostra sul sito"}
                  >
                    {u.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      run(async () => {
                        if (!confirm(`Eliminare "${u.title}"?`)) return;
                        await deleteProjectUpdate(u.id);
                        setItems((prev) => prev.filter((x) => x.id !== u.id));
                      })
                    }
                    className="p-2 text-slate-400 hover:text-red-600"
                    aria-label="Elimina aggiornamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea rows={2} value={u.body} onChange={(e) => edit(u.id, { body: e.target.value })} onBlur={() => save(u.id)} className={`${inputCls} resize-y mb-3`} aria-label="Testo" />
              <PhotoStrip
                items={u.images}
                onAdd={async (media) => {
                  await run(async () => {
                    const { id } = await addUpdateImage(u.id, media.id, u.images.length);
                    edit(u.id, { images: [...u.images, { id, media: { url: media.url, original_filename: media.original_filename } }] });
                  });
                }}
                onRemove={async (imageId) => {
                  await run(async () => {
                    await removeUpdateImage(imageId);
                    edit(u.id, { images: u.images.filter((i) => i.id !== imageId) });
                  });
                }}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
