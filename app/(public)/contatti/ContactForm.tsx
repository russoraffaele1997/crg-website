"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    subject: "", message: "", privacy: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacy) { setError("Devi accettare la privacy policy."); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "contact" }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError("Errore nell'invio. Riprova o contattaci direttamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-crg-red-light border border-crg-red/20 p-10 text-center">
        <svg className="w-12 h-12 text-crg-red mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Messaggio inviato</h3>
        <p className="font-sans text-sm text-mid-gray max-w-sm mx-auto">
          Grazie per averci contattato. Ti risponderemo entro 24 ore lavorative.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cf-fn" className="input-label">Nome *</label>
          <input id="cf-fn" type="text" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="input-field" placeholder="Mario" />
        </div>
        <div>
          <label htmlFor="cf-ln" className="input-label">Cognome *</label>
          <input id="cf-ln" type="text" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="input-field" placeholder="Rossi" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cf-em" className="input-label">Email *</label>
          <input id="cf-em" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="input-field" placeholder="mario@email.com" />
        </div>
        <div>
          <label htmlFor="cf-ph" className="input-label">Telefono</label>
          <input id="cf-ph" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input-field" placeholder="+39 333 000 0000" />
        </div>
      </div>

      <div>
        <label htmlFor="cf-sub" className="input-label">Oggetto *</label>
        <select id="cf-sub" required value={form.subject} onChange={(e) => set("subject", e.target.value)} className="input-field">
          <option value="">— Seleziona —</option>
          <option value="info-project">Informazioni su un progetto</option>
          <option value="appointment">Richiesta appuntamento</option>
          <option value="investment">Opportunità di investimento</option>
          <option value="other">Altro</option>
        </select>
      </div>

      <div>
        <label htmlFor="cf-msg" className="input-label">Messaggio *</label>
        <textarea id="cf-msg" rows={5} required value={form.message} onChange={(e) => set("message", e.target.value)} className="input-field resize-none" placeholder="Scrivi il tuo messaggio..." />
      </div>

      <div className="flex items-start gap-3">
        <input id="cf-prv" type="checkbox" checked={form.privacy} onChange={(e) => set("privacy", e.target.checked)} className="mt-0.5 w-4 h-4 accent-crg-red cursor-pointer" required />
        <label htmlFor="cf-prv" className="font-sans text-xs text-mid-gray leading-relaxed cursor-pointer">
          Acconsento al trattamento dei dati personali secondo la{" "}
          <a href="#" className="underline hover:text-crg-red transition-colors">Privacy Policy</a>.
        </label>
      </div>

      {error && <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
        {submitting ? "Invio..." : "Invia messaggio"}
      </button>
    </form>
  );
}
