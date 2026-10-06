"use client";

import { useState } from "react";
import { PRIVACY_URL, submitLead } from "@/lib/leads/client";

/** "Avvisami": a two-field sign-up for news on one project (new units, a unit freeing up, progress). */
export default function NotifyForm({ projectId, projectTitle }: { projectId: string; projectTitle: string }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) { setError("Inserisci nome ed email."); return; }
    if (!privacy) { setError("Serve il consenso alla privacy."); return; }
    setState("sending"); setError("");
    try {
      await submitLead({ type: "notify", firstName, email, projectId, privacy });
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'invio. Riprova.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <p className="font-sans text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-4" role="status">
        Fatto, {firstName}! Ti scriveremo appena ci sono novità su {projectTitle}.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nt-fn" className="input-label">Nome</label>
          <input id="nt-fn" type="text" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field bg-white" />
        </div>
        <div>
          <label htmlFor="nt-em" className="input-label">Email</label>
          <input id="nt-em" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field bg-white" />
        </div>
      </div>
      <div className="flex items-start gap-3">
        <input id="nt-prv" type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 w-4 h-4 accent-crg-red cursor-pointer" />
        <label htmlFor="nt-prv" className="font-sans text-xs text-mid-gray leading-relaxed cursor-pointer">
          Acconsento a ricevere email su questo progetto secondo l&apos;
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-crg-red">informativa privacy</a>.
          Puoi chiedere di non riceverle più in qualsiasi momento.
        </label>
      </div>
      {error && <p className="font-sans text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-outline disabled:opacity-50">
        {state === "sending" ? "Invio…" : "Avvisami"}
      </button>
    </form>
  );
}
