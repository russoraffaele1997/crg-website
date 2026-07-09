"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import {
  createCommunication,
  updateCommunication,
  deleteCommunication,
  duplicateCommunication,
  createCommunicationCategory,
  type CommunicationInput,
} from "@/app/admin/(protected)/comunicazioni/actions";
import MediaField from "@/components/admin/MediaField";
import type { MediaLibraryItem } from "@/lib/types/media";
import type { CommunicationCategory } from "@/lib/data/communications";

type PublishMode = "draft" | "now" | "scheduled";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  mode: "create" | "edit";
  communicationId?: string;
  categories: CommunicationCategory[];
  initial?: Partial<CommunicationInput> & { coverImage?: MediaLibraryItem | null };
}

export default function CommunicationForm({ mode, communicationId, categories: initialCategories, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [categories, setCategories] = useState(initialCategories);
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [coverImage, setCoverImage] = useState<MediaLibraryItem | null>(initial?.coverImage ?? null);
  const [seoMetaTitle, setSeoMetaTitle] = useState(initial?.seoMetaTitle ?? "");
  const [seoMetaDescription, setSeoMetaDescription] = useState(initial?.seoMetaDescription ?? "");
  const [ogTitle, setOgTitle] = useState(initial?.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(initial?.ogDescription ?? "");

  const initialMode: PublishMode =
    initial?.publishStatus === "published"
      ? initial.publishedAt && new Date(initial.publishedAt) > new Date()
        ? "scheduled"
        : "now"
      : "draft";
  const [publishMode, setPublishMode] = useState<PublishMode>(initialMode);
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(initial?.publishedAt ?? null));

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value, { lower: true, strict: true, locale: "it" }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const { id } = await createCommunicationCategory(newCategory.trim());
    setCategories((prev) => [...prev, { id, slug: "", name: newCategory.trim() }]);
    setCategoryId(id);
    setNewCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSaved(false);

    const publishedAt =
      publishMode === "draft" ? null : publishMode === "now" ? new Date().toISOString() : new Date(scheduledAt).toISOString();

    const input: CommunicationInput = {
      slug,
      title,
      subtitle,
      excerpt,
      body,
      categoryId: categoryId || null,
      coverImageId: coverImage?.id ?? null,
      isFeatured,
      publishStatus: publishMode === "draft" ? "draft" : "published",
      publishedAt,
      seoMetaTitle,
      seoMetaDescription,
      ogTitle,
      ogDescription,
    };

    try {
      if (mode === "create") {
        await createCommunication(input);
      } else if (communicationId) {
        await updateCommunication(communicationId, input);
        setSaved(true);
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message);
      } else if (!(err instanceof Error)) {
        throw err;
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!communicationId) return;
    if (!confirm(`Eliminare definitivamente "${title}"?`)) return;
    setDeleting(true);
    try {
      await deleteCommunication(communicationId);
    } catch (err) {
      if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message);
        setDeleting(false);
      }
    }
  };

  const handleDuplicate = async () => {
    if (!communicationId) return;
    setDuplicating(true);
    try {
      const { id } = await duplicateCommunication(communicationId);
      router.push(`/admin/comunicazioni/${id}`);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      setDuplicating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Titolo</label>
          <input
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Slug (URL)</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Sottotitolo</label>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Estratto (per l&rsquo;elenco)</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red resize-none"
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Testo completo</label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red resize-none"
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Categoria</label>
        <div className="flex gap-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-crg-red"
          >
            <option value="">— Nessuna —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nuova categoria..."
            className="w-40 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-crg-red"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
            className="bg-slate-900 text-white text-sm px-4 rounded-lg disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <MediaField label="Immagine di copertina" value={coverImage} onChange={setCoverImage} />

      <div className="flex items-center gap-2">
        <input
          id="featured"
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="w-4 h-4 accent-crg-red"
        />
        <label htmlFor="featured" className="text-sm text-slate-700">Comunicazione in evidenza</label>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Pubblicazione</label>
        <div className="flex gap-4 mb-3">
          {(["draft", "now", "scheduled"] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" checked={publishMode === m} onChange={() => setPublishMode(m)} className="accent-crg-red" />
              {m === "draft" ? "Bozza" : m === "now" ? "Pubblica ora" : "Programma"}
            </label>
          ))}
        </div>
        {publishMode === "scheduled" && (
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
          />
        )}
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Meta title</label>
            <input value={seoMetaTitle} onChange={(e) => setSeoMetaTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red" />
          </div>
          <div>
            <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Meta description</label>
            <textarea value={seoMetaDescription} onChange={(e) => setSeoMetaDescription(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Open Graph title</label>
              <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Open Graph description</label>
              <input value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red" />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
      {saved && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">Modifiche salvate.</p>}

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? "Salvataggio..." : mode === "create" ? "Crea comunicazione" : "Salva modifiche"}
        </button>

        {mode === "edit" && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={duplicating}
              className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              {duplicating ? "Duplicazione..." : "Duplica"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? "Eliminazione..." : "Elimina"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
