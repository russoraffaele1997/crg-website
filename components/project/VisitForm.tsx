"use client";

import { useState } from "react";
import type { CarBox, ProjectUnit } from "@/lib/types/project";
import { isSelectable } from "@/lib/projects/derive";
import { PRIVACY_URL, submitLead } from "@/lib/leads/client";
import { useVisit } from "./VisitContext";

export default function VisitForm({
  projectId,
  projectTitle,
  units,
  carBoxes,
  mode = "visit",
}: {
  projectId: string;
  projectTitle: string;
  units: ProjectUnit[];
  carBoxes: CarBox[];
  /** "info" when nothing is on sale: a plain question, no visit slot. */
  mode?: "visit" | "info";
}) {
  const isVisit = mode === "visit";
  const { unitCode, carBoxId, setUnitCode, setCarBoxId } = useVisit();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    preferredDay: "", preferredTime: "", message: "", privacy: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectableUnits = units.filter((u) => isSelectable(u.status));
  const openBoxes = carBoxes.filter((b) => b.status !== "sold");
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Inserisci nome, cognome ed email per poterti ricontattare.");
      return;
    }
    if (!form.privacy) { setError("Per inviare la richiesta serve il consenso alla privacy."); return; }
    setSubmitting(true); setError("");
    try {
      await submitLead({
        type: isVisit ? "appointment" : "contact",
        ...form,
        projectId,
        unitCode: unitCode || undefined,
        carBoxId: carBoxId || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'invio. Riprova o contattaci direttamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-crg-red-light border border-crg-red/20 p-10 text-center" role="status">
        <svg className="w-12 h-12 text-crg-red mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Richiesta ricevuta</h3>
        <p className="font-sans text-sm text-mid-gray max-w-sm mx-auto">
          {isVisit
            ? `Grazie ${form.firstName}. Ti ricontattiamo entro 24 ore lavorative per confermare giorno e orario della visita a ${projectTitle}.`
            : `Grazie ${form.firstName}. Ti rispondiamo entro 24 ore lavorative.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-fn" className="input-label">Nome *</label>
          <input id="ap-fn" type="text" autoComplete="given-name" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="input-field" />
        </div>
        <div>
          <label htmlFor="ap-ln" className="input-label">Cognome *</label>
          <input id="ap-ln" type="text" autoComplete="family-name" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-em" className="input-label">Email *</label>
          <input id="ap-em" type="email" autoComplete="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="input-field" />
        </div>
        <div>
          <label htmlFor="ap-ph" className="input-label">Telefono</label>
          <input id="ap-ph" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input-field" />
        </div>
      </div>

      {selectableUnits.length > 0 && (
        <div>
          <label htmlFor="ap-unit" className="input-label">Unità che vuoi visitare</label>
          <select id="ap-unit" value={unitCode} onChange={(e) => setUnitCode(e.target.value)} className="input-field">
            <option value="">Non ho ancora deciso: vorrei vederne alcune</option>
            {selectableUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}, {u.typology}, {u.sqm} mq{u.price ? `, ${u.price}` : ""}
                {u.status === "optioned" ? " (prenotata)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {openBoxes.length > 0 && (
        <div>
          <label htmlFor="ap-box" className="input-label">Box auto (facoltativo)</label>
          <select id="ap-box" value={carBoxId} onChange={(e) => setCarBoxId(e.target.value)} className="input-field">
            <option value="">Nessun box per ora</option>
            {openBoxes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}, {b.sqm} mq{b.status === "optioned" ? " (prenotato)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {isVisit && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-day" className="input-label">Giorno preferito</label>
          <input id="ap-day" type="date" value={form.preferredDay} onChange={(e) => set("preferredDay", e.target.value)} className="input-field" min={new Date().toISOString().split("T")[0]} />
        </div>
        <div>
          <label htmlFor="ap-time" className="input-label">Fascia oraria</label>
          <select id="ap-time" value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} className="input-field">
            <option value="">Indifferente</option>
            <option value="morning">Mattina (09:00 – 12:00)</option>
            <option value="afternoon">Pomeriggio (14:00 – 17:00)</option>
            <option value="evening">Tardo pomeriggio (17:00 – 19:00)</option>
          </select>
        </div>
      </div>
      )}

      <div>
        <label htmlFor="ap-msg" className="input-label">{isVisit ? "Vuoi dirci qualcosa? (facoltativo)" : "La tua domanda"}</label>
        <textarea id="ap-msg" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} className="input-field resize-none" placeholder="Es. cerco un trilocale con terrazzo, mi serve un mutuo…" />
      </div>

      <div className="flex items-start gap-3">
        <input id="ap-prv" type="checkbox" checked={form.privacy} onChange={(e) => set("privacy", e.target.checked)} className="mt-0.5 w-4 h-4 accent-crg-red cursor-pointer" required />
        <label htmlFor="ap-prv" className="font-sans text-xs text-mid-gray leading-relaxed cursor-pointer">
          Ho letto l&apos;
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-crg-red transition-colors">informativa privacy</a>
          {" "}e acconsento al trattamento dei miei dati per essere ricontattato. *
        </label>
      </div>

      {error && <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3" role="alert">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto disabled:opacity-50">
        {submitting ? "Invio in corso…" : isVisit ? "Prenota la visita" : "Invia la richiesta"}
      </button>
    </form>
  );
}
