"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { createProject, updateProjectGeneral, deleteProject, type ProjectGeneralInput } from "@/app/admin/(protected)/progetti/actions";
import { categoryOptions, projectStatusOptions, publishStatusOptions } from "@/lib/admin/project-options";
import MediaField from "@/components/admin/MediaField";
import type { MediaLibraryItem } from "@/lib/types/media";

interface Props {
  mode: "create" | "edit";
  projectId?: string;
  initial?: Partial<ProjectGeneralInput> & { coverImage?: MediaLibraryItem | null };
}

export default function ProjectGeneralForm({ mode, projectId, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [category, setCategory] = useState(initial?.category ?? "residential");
  const [status, setStatus] = useState(initial?.status ?? "for-sale");
  const [statusLabel, setStatusLabel] = useState(initial?.statusLabel ?? "In vendita");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [featuredOrder, setFeaturedOrder] = useState<string>(
    initial?.featuredOrder != null ? String(initial.featuredOrder) : ""
  );
  const [isSpotlight, setIsSpotlight] = useState(initial?.isSpotlight ?? false);
  const [spotlightSpecs, setSpotlightSpecs] = useState<{ label: string; value: string }[]>(
    initial?.spotlightSpecs?.length ? initial.spotlightSpecs : [
      { value: "", label: "" },
      { value: "", label: "" },
      { value: "", label: "" },
      { value: "", label: "" },
    ]
  );
  const [publishStatus, setPublishStatus] = useState(initial?.publishStatus ?? "draft");
  const [coverImage, setCoverImage] = useState<MediaLibraryItem | null>(initial?.coverImage ?? null);
  const [seoMetaTitle, setSeoMetaTitle] = useState(initial?.seoMetaTitle ?? "");
  const [seoMetaDescription, setSeoMetaDescription] = useState(initial?.seoMetaDescription ?? "");
  const [ogTitle, setOgTitle] = useState(initial?.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(initial?.ogDescription ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value, { lower: true, strict: true, locale: "it" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSaved(false);

    const input: ProjectGeneralInput = {
      slug,
      title,
      location,
      category: category as ProjectGeneralInput["category"],
      status: status as ProjectGeneralInput["status"],
      statusLabel,
      shortDescription,
      description,
      coverImageId: coverImage?.id ?? null,
      isFeatured,
      featuredOrder: featuredOrder ? Number(featuredOrder) : null,
      isSpotlight,
      spotlightSpecs: spotlightSpecs.filter((s) => s.label.trim() || s.value.trim()),
      publishStatus: publishStatus as ProjectGeneralInput["publishStatus"],
      seoMetaTitle,
      seoMetaDescription,
      ogTitle,
      ogDescription,
    };

    try {
      if (mode === "create") {
        await createProject(input);
      } else if (projectId) {
        await updateProjectGeneral(projectId, input);
        setSaved(true);
        router.refresh();
      }
    } catch (err) {
      // Next.js redirect() throws internally — rethrow anything that isn't a real error
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
    if (!projectId) return;
    if (!confirm(`Eliminare definitivamente "${title}"? Questa azione non può essere annullata.`)) return;
    setDeleting(true);
    try {
      await deleteProject(projectId);
    } catch (err) {
      if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message);
        setDeleting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Nome progetto</label>
          <input
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
            placeholder="Palazzo Rue"
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
            placeholder="palazzo-rue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Località</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
            placeholder="Casoria, NA"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red bg-white"
          >
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Stato lavori</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red bg-white"
          >
            {projectStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Etichetta stato (visibile)</label>
          <input
            required
            value={statusLabel}
            onChange={(e) => setStatusLabel(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
            placeholder="In vendita"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Descrizione breve</label>
        <textarea
          required
          rows={2}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red resize-none"
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Descrizione completa</label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red resize-none"
        />
      </div>

      <MediaField label="Immagine di copertina" value={coverImage} onChange={setCoverImage} />

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        <div className="flex items-center gap-2 pb-2.5">
          <input
            id="featured"
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 accent-crg-red"
          />
          <label htmlFor="featured" className="text-sm text-slate-700">In evidenza in homepage</label>
        </div>
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Ordine in evidenza</label>
          <input
            type="number"
            value={featuredOrder}
            onChange={(e) => setFeaturedOrder(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red"
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Pubblicazione</label>
          <select
            value={publishStatus}
            onChange={(e) => setPublishStatus(e.target.value as typeof publishStatus)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red bg-white"
          >
            {publishStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Progetto in evidenza (homepage)</h2>
        <p className="text-xs text-slate-500 mb-4">
          Il progetto in evidenza appare nella sezione dedicata in fondo alla homepage. Titolo e descrizione vengono
          presi automaticamente da questo progetto: qui vanno inseriti solo i dati tecnici della scheda.
        </p>
        <button
          type="button"
          onClick={() => setIsSpotlight((v) => !v)}
          className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${
            isSpotlight
              ? "bg-crg-red text-white"
              : "border border-slate-300 text-slate-700 hover:border-crg-red hover:text-crg-red"
          }`}
        >
          {isSpotlight ? "✓ Progetto in evidenza" : "Metti progetto in evidenza"}
        </button>

        {isSpotlight && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs tracking-wider uppercase text-slate-500 mb-3">Dati tecnici (scheda in evidenza)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spotlightSpecs.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="Valore (es. 5)"
                    value={spec.value}
                    onChange={(e) =>
                      setSpotlightSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, value: e.target.value } : s)))
                    }
                    className="w-1/3 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
                  />
                  <input
                    placeholder="Etichetta (es. Unità residenziali)"
                    value={spec.label}
                    onChange={(e) =>
                      setSpotlightSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, label: e.target.value } : s)))
                    }
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crg-red"
                  />
                </div>
              ))}
            </div>
          </div>
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
          {submitting ? "Salvataggio..." : mode === "create" ? "Crea progetto" : "Salva modifiche"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? "Eliminazione..." : "Elimina progetto"}
          </button>
        )}
      </div>
    </form>
  );
}
