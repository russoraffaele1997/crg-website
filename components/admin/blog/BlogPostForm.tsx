"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import type { JSONContent } from "@tiptap/react";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  duplicateBlogPost,
  createBlogCategory,
  createBlogTag,
  type BlogPostInput,
} from "@/app/admin/(protected)/blog/actions";
import BlockEditor from "./BlockEditor";
import BlogHistory from "./BlogHistory";
import MediaField from "@/components/admin/MediaField";
import type { MediaLibraryItem } from "@/lib/types/media";
import type { BlogCategory, BlogTag } from "@/lib/data/blog";
import type { AdminAuthorOption } from "@/lib/admin/data/blog";
import { Eye, Pencil, History } from "lucide-react";

type PublishMode = "draft" | "now" | "scheduled";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  mode: "create" | "edit";
  postId?: string;
  categories: BlogCategory[];
  tags: BlogTag[];
  authors: AdminAuthorOption[];
  initial?: Partial<BlogPostInput> & { coverImage?: MediaLibraryItem | null };
}

export default function BlogPostForm({ mode, postId, categories: initialCategories, tags: initialTags, authors, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState<JSONContent>((initial?.contentJson as JSONContent) ?? { type: "doc", content: [{ type: "paragraph" }] });
  const [categories, setCategories] = useState(initialCategories);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [tags, setTags] = useState(initialTags);
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [newTag, setNewTag] = useState("");
  const [authorId, setAuthorId] = useState(initial?.authorId ?? "");
  const [coverImage, setCoverImage] = useState<MediaLibraryItem | null>(initial?.coverImage ?? null);
  const [seoMetaTitle, setSeoMetaTitle] = useState(initial?.seoMetaTitle ?? "");
  const [seoMetaDescription, setSeoMetaDescription] = useState(initial?.seoMetaDescription ?? "");
  const [ogTitle, setOgTitle] = useState(initial?.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(initial?.ogDescription ?? "");
  const [previewMode, setPreviewMode] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

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
    const { id } = await createBlogCategory(newCategory.trim());
    setCategories((prev) => [...prev, { id, slug: "", name: newCategory.trim() }]);
    setCategoryId(id);
    setNewCategory("");
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const { id } = await createBlogTag(newTag.trim());
    setTags((prev) => [...prev, { id, slug: "", name: newTag.trim() }]);
    setTagIds((prev) => [...prev, id]);
    setNewTag("");
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSaved(false);

    const publishedAt =
      publishMode === "draft" ? null : publishMode === "now" ? new Date().toISOString() : new Date(scheduledAt).toISOString();

    const input: BlogPostInput = {
      slug,
      title,
      excerpt,
      contentJson: content,
      categoryId: categoryId || null,
      authorId: authorId || null,
      tagIds,
      coverImageId: coverImage?.id ?? null,
      publishStatus: publishMode === "draft" ? "draft" : "published",
      publishedAt,
      seoMetaTitle,
      seoMetaDescription,
      ogTitle,
      ogDescription,
    };

    try {
      if (mode === "create") {
        await createBlogPost(input);
      } else if (postId) {
        await updateBlogPost(postId, input);
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
    if (!postId) return;
    if (!confirm(`Eliminare definitivamente "${title}"?`)) return;
    setDeleting(true);
    try {
      await deleteBlogPost(postId);
    } catch (err) {
      if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message);
        setDeleting(false);
      }
    }
  };

  const handleDuplicate = async () => {
    if (!postId) return;
    setDuplicating(true);
    try {
      const { id } = await duplicateBlogPost(postId);
      router.push(`/admin/blog/${id}`);
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
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Estratto</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Autore</label>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-crg-red"
          >
            <option value="">— Nessuno —</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
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
              placeholder="Nuova..."
              className="w-24 border border-slate-300 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:border-crg-red"
            />
            <button type="button" onClick={handleAddCategory} disabled={!newCategory.trim()} className="bg-slate-900 text-white text-sm px-3 rounded-lg disabled:opacity-40">+</button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Tag</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTag(t.id)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                tagIds.includes(t.id) ? "bg-crg-red text-white border-crg-red" : "text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Nuovo tag..."
            className="w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
          />
          <button type="button" onClick={handleAddTag} disabled={!newTag.trim()} className="bg-slate-900 text-white text-sm px-4 rounded-lg disabled:opacity-40">+</button>
        </div>
      </div>

      <MediaField label="Immagine di copertina" value={coverImage} onChange={setCoverImage} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs tracking-wider uppercase text-slate-500">Contenuto articolo</label>
          <button
            type="button"
            onClick={() => setPreviewMode((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-crg-red hover:text-crg-red-dark"
          >
            {previewMode ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {previewMode ? "Torna a modifica" : "Anteprima"}
          </button>
        </div>
        <BlockEditor initialContent={content} onChange={setContent} editable={!previewMode} />
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

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
      {saved && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">Modifiche salvate.</p>}

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? "Salvataggio..." : mode === "create" ? "Crea articolo" : "Salva modifiche"}
        </button>

        {mode === "edit" && (
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setHistoryOpen(true)} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <History className="w-3.5 h-3.5" />
              Cronologia
            </button>
            <button type="button" onClick={handleDuplicate} disabled={duplicating} className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50">
              {duplicating ? "Duplicazione..." : "Duplica"}
            </button>
            <button type="button" onClick={handleDelete} disabled={deleting} className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50">
              {deleting ? "Eliminazione..." : "Elimina"}
            </button>
          </div>
        )}
      </div>

      {mode === "edit" && postId && (
        <BlogHistory
          postId={postId}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onRestored={() => {
            setHistoryOpen(false);
            router.refresh();
          }}
        />
      )}
    </form>
  );
}
