"use client";

import { useState } from "react";
import { PRIVACY_URL, submitLead } from "@/lib/leads/client";

/** Documents released on request: the link only comes back from the server after a contact is left. */
export default function DocumentRequest({
  projectId,
  documentId,
  title,
}: {
  projectId: string;
  documentId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [sending, setSending] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-crg-red hover:underline font-medium">
        ↓ Scarica ora
      </a>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="font-sans text-sm text-crg-red hover:underline font-medium">
        Richiedi il documento
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) { setError("Inserisci nome ed email."); return; }
    if (!privacy) { setError("Serve il consenso alla privacy."); return; }
    setSending(true); setError("");
    try {
      const res = await submitLead({ type: "document", firstName, email, projectId, documentId, privacy });
      if (!res.documentUrl) throw new Error("Documento non disponibile al momento. Contattaci.");
      setUrl(res.documentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'invio. Riprova.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 w-full" noValidate aria-label={`Richiedi ${title}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input aria-label="Nome" placeholder="Nome" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field bg-white" />
        <input aria-label="Email" placeholder="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field bg-white" />
      </div>
      <label className="flex items-start gap-2 font-sans text-xs text-mid-gray cursor-pointer">
        <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 w-4 h-4 accent-crg-red" />
        <span>
          Acconsento al trattamento dei dati secondo l&apos;
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline">informativa privacy</a>.
        </span>
      </label>
      {error && <p className="font-sans text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary px-6 py-2.5 disabled:opacity-50">
        {sending ? "Invio…" : "Ricevi il documento"}
      </button>
    </form>
  );
}
