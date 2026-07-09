"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePageSeo } from "@/app/admin/(protected)/seo/actions";

interface Props {
  pagePath: string;
  initial: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    twitterCard: string;
  };
}

export default function PageSeoForm({ pagePath, initial }: Props) {
  const router = useRouter();
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle);
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription);
  const [canonicalUrl, setCanonicalUrl] = useState(initial.canonicalUrl);
  const [ogTitle, setOgTitle] = useState(initial.ogTitle);
  const [ogDescription, setOgDescription] = useState(initial.ogDescription);
  const [twitterCard, setTwitterCard] = useState(initial.twitterCard);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSaved(false);
    try {
      await savePageSeo({
        pagePath,
        seoMetaTitle: metaTitle,
        seoMetaDescription: metaDescription,
        canonicalUrl,
        ogTitle,
        ogDescription,
        twitterCard,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Meta title</label>
        <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red" />
      </div>
      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Meta description</label>
        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red resize-none" />
      </div>
      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Canonical URL</label>
        <input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://www.crg-srl.it/..." className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crg-red font-mono" />
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
      <div>
        <label className="block text-xs tracking-wider uppercase text-slate-500 mb-2">Twitter card</label>
        <select value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-crg-red">
          <option value="summary_large_image">summary_large_image</option>
          <option value="summary">summary</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
      {saved && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">Modifiche salvate.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {submitting ? "Salvataggio..." : "Salva modifiche"}
      </button>
    </form>
  );
}
