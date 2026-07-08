"use client";

import { useState } from "react";

const contactInfo = [
  {
    label: "Sede",
    value: "Via Traversa Michelangelo, 66\n80026 Casoria, NA",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "crgsrl2025@gmail.com",
    href: "mailto:crgsrl2025@gmail.com",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "Telefono",
    value: "+39 331 836 4042",
    href: "tel:+393318364042",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: "Orari",
    value: "Lun – Ven: 9:00 – 18:00\nSab: 9:00 – 13:00",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function ContactForm() {
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

export default function ContattiPage() {
  return (
    <>
      <section className="pt-40 pb-20 bg-charcoal">
        <div className="container-custom">
          <span className="section-label block mb-6">Contatti</span>
          <h1 className="section-title-light max-w-xl">Siamo qui per te</h1>
          <p className="font-sans text-sm text-white/35 mt-4 max-w-lg leading-relaxed">
            Hai domande su un progetto o vuoi un appuntamento? Scrivici, ti risponderemo entro 24 ore.
          </p>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <h2 className="font-heading text-2xl font-bold text-charcoal mb-8">
                Informazioni di contatto
              </h2>
              <div className="space-y-8">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-crg-red-light flex items-center justify-center shrink-0 text-crg-red">
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mb-1">
                        {info.label}
                      </div>
                      {info.href ? (
                        <a href={info.href} className="font-sans text-sm text-charcoal hover:text-crg-red transition-colors whitespace-pre-line">
                          {info.value}
                        </a>
                      ) : (
                        <span className="font-sans text-sm text-charcoal whitespace-pre-line">{info.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-10 aspect-square bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                <div className="text-center text-charcoal/40">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                  <span className="font-sans text-xs">Sostituisci con Google Maps embed</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <h2 className="font-heading text-2xl font-bold text-charcoal mb-8">
                Inviaci un messaggio
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-anthracite">
        <div className="container-custom text-center">
          <h2 className="section-title-light mb-4 max-w-xl mx-auto">
            Preferisci un appuntamento in sede?
          </h2>
          <p className="font-sans text-sm text-white/35 mb-10 max-w-md mx-auto">
            Il nostro team commerciale è a tua disposizione per mostrarti i progetti.
          </p>
          <a href="tel:+393318364042" className="btn-primary">Chiamaci ora</a>
        </div>
      </section>
    </>
  );
}
