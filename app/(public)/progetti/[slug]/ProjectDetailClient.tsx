"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import type { Project, ProjectUnit } from "@/data/projects";
import ClientImage from "@/components/ClientImage";

const categoryGradients: Record<string, string> = {
  residential: "from-stone-400 to-stone-600",
  commercial:  "from-slate-400 to-slate-600",
  industrial:  "from-zinc-400 to-zinc-600",
};

const unitStatusConfig: Record<string, { label: string; cls: string }> = {
  available: { label: "Disponibile", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  optioned:  { label: "Opzionata",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  sold:      { label: "Venduta",     cls: "bg-red-50 text-red-700 border-red-200" },
  rented:    { label: "Affittata",   cls: "bg-blue-50 text-blue-700 border-blue-200" },
};

// ─── Gallery ─────────────────────────────────────────────────────────────────
function Gallery({ images, title, category }: { images: string[]; title: string; category: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className={`relative overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-crg-red ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
          >
            <ClientImage
              src={src} alt={`${title} — foto ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              fallbackClass={`w-full h-full bg-gradient-to-br ${categoryGradients[category]}`}
            />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white font-sans text-sm tracking-widest uppercase" onClick={() => setLightbox(null)}>
            Chiudi ✕
          </button>
          <ClientImage
            src={images[lightbox]} alt={`${title} — foto ${lightbox + 1}`}
            className="max-w-4xl w-full max-h-[80vh] object-contain"
            fallbackClass={`w-96 h-64 bg-gradient-to-br ${categoryGradients[category]}`}
          />
        </div>
      )}
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ items }: { items: Project["timeline"] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border-warm" />
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-6 pl-12 pb-8 relative">
          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${item.completed ? "bg-crg-red border-crg-red" : "bg-cream border-border-warm"}`}>
            {item.completed && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mb-1">{item.date}</div>
            <div className={`font-sans text-base ${item.completed ? "text-charcoal font-medium" : "text-mid-gray"}`}>
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Units table ──────────────────────────────────────────────────────────────
function UnitsTable({ units }: { units: ProjectUnit[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-warm">
            {["Unità", "Tipologia", "Piano", "Superficie", "Dettagli", "Prezzo", "Stato"].map((col) => (
              <th key={col} className="font-sans text-[10px] tracking-[0.2em] uppercase text-mid-gray py-4 px-4 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr key={unit.id} className={`border-b border-border-warm/50 transition-colors ${unit.status === "available" ? "hover:bg-crg-red-light" : "opacity-55"}`}>
              <td className="font-heading text-sm font-semibold text-charcoal py-4 px-4">{unit.name}</td>
              <td className="font-sans text-sm text-mid-gray py-4 px-4">{unit.typology}</td>
              <td className="font-sans text-sm text-mid-gray py-4 px-4">{unit.floor ?? "—"}</td>
              <td className="font-sans text-sm text-mid-gray py-4 px-4">
                {unit.outdoorSqm
                  ? `${unit.sqm} mq int. + ${unit.outdoorSqm} mq est.`
                  : `${unit.sqm} mq`}
              </td>
              <td className="font-sans text-sm text-mid-gray py-4 px-4">
                {unit.rooms ? `${unit.rooms} vani` : unit.destination ?? "—"}
              </td>
              <td className="font-sans text-sm text-charcoal font-medium py-4 px-4">{unit.price ?? "—"}</td>
              <td className="py-4 px-4">
                <span className={`inline-block font-sans text-[10px] tracking-wider uppercase px-3 py-1 border ${unitStatusConfig[unit.status].cls}`}>
                  {unitStatusConfig[unit.status].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Appointment form ─────────────────────────────────────────────────────────
function AppointmentForm({ project, availableUnits }: { project: Project; availableUnits: ProjectUnit[] }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    unitId: "", preferredDay: "", preferredTime: "", message: "", privacy: false,
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
        body: JSON.stringify({ ...form, projectId: project.id, projectTitle: project.title }),
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
        <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Richiesta inviata</h3>
        <p className="font-sans text-sm text-mid-gray max-w-sm mx-auto">
          La tua richiesta è stata inviata correttamente. Ti ricontatteremo per confermare l&rsquo;appuntamento.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-fn" className="input-label">Nome *</label>
          <input id="ap-fn" type="text" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="input-field" placeholder="Mario" />
        </div>
        <div>
          <label htmlFor="ap-ln" className="input-label">Cognome *</label>
          <input id="ap-ln" type="text" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="input-field" placeholder="Rossi" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-em" className="input-label">Email *</label>
          <input id="ap-em" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="input-field" placeholder="mario@email.com" />
        </div>
        <div>
          <label htmlFor="ap-ph" className="input-label">Telefono</label>
          <input id="ap-ph" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input-field" placeholder="+39 333 000 0000" />
        </div>
      </div>

      <div>
        <label htmlFor="ap-proj" className="input-label">Progetto</label>
        <input id="ap-proj" type="text" readOnly value={project.title} className="input-field bg-light-gray cursor-not-allowed" />
      </div>

      {availableUnits.length > 0 && (
        <div>
          <label htmlFor="ap-unit" className="input-label">Unità di interesse</label>
          <select id="ap-unit" value={form.unitId} onChange={(e) => set("unitId", e.target.value)} className="input-field">
            <option value="">— Seleziona un&apos;unità (opzionale) —</option>
            {availableUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.typology} —{" "}
                {u.outdoorSqm
                  ? `${u.sqm} mq int. + ${u.outdoorSqm} mq est.`
                  : `${u.sqm} mq`}
                {u.price ? ` — ${u.price}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ap-day" className="input-label">Giorno preferito</label>
          <input id="ap-day" type="date" value={form.preferredDay} onChange={(e) => set("preferredDay", e.target.value)} className="input-field" min={new Date().toISOString().split("T")[0]} />
        </div>
        <div>
          <label htmlFor="ap-time" className="input-label">Fascia oraria</label>
          <select id="ap-time" value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} className="input-field">
            <option value="">— Seleziona —</option>
            <option value="morning">Mattina (09:00 – 12:00)</option>
            <option value="afternoon">Pomeriggio (14:00 – 17:00)</option>
            <option value="evening">Tardo pomeriggio (17:00 – 19:00)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ap-msg" className="input-label">Messaggio (opzionale)</label>
        <textarea id="ap-msg" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} className="input-field resize-none" placeholder="Informazioni aggiuntive..." />
      </div>

      <div className="flex items-start gap-3">
        <input id="ap-prv" type="checkbox" checked={form.privacy} onChange={(e) => set("privacy", e.target.checked)} className="mt-0.5 w-4 h-4 accent-crg-red cursor-pointer" required />
        <label htmlFor="ap-prv" className="font-sans text-xs text-mid-gray leading-relaxed cursor-pointer">
          Acconsento al trattamento dei dati personali secondo la{" "}
          <a href="#" className="underline hover:text-crg-red transition-colors">Privacy Policy</a>. Il consenso è obbligatorio.
        </label>
      </div>

      {error && <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto disabled:opacity-50">
        {submitting ? "Invio in corso..." : "Invia richiesta"}
      </button>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProjectDetailClient({ project }: { project: Project }) {
  const descRef = useRef<HTMLDivElement>(null);
  const descInView = useInView(descRef, { once: true, margin: "-60px" });
  const availableUnits = project.units.filter((u) => u.status === "available");

  const categoryLabels: Record<string, string> = {
    residential: "Residenziale", commercial: "Commerciale", industrial: "Industriale",
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end bg-charcoal overflow-hidden">
        <ClientImage
          src={project.coverImage} alt={project.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          fallbackClass={`absolute inset-0 w-full h-full bg-gradient-to-br ${categoryGradients[project.category]}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-crg-red" />

        <div className="container-custom relative z-10 pb-14">
          <div className="flex flex-wrap gap-3 mb-5">
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-crg-red">
              {categoryLabels[project.category]}
            </span>
            <span className="text-white/30">·</span>
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/50">
              {project.statusLabel}
            </span>
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-6xl text-white mb-3 leading-tight">
            {project.title}
          </h1>
          <p className="font-sans text-sm text-white/45 flex items-center gap-1.5 mb-8">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {project.location}
          </p>
          <a href="#appuntamento" className="btn-primary">Richiedi appuntamento</a>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-warm">
        <div className="container-custom py-4">
          <nav className="font-sans text-xs text-mid-gray flex items-center gap-2">
            <Link href="/" className="hover:text-crg-red transition-colors">Home</Link>
            <span>›</span>
            <Link href="/progetti" className="hover:text-crg-red transition-colors">Progetti</Link>
            <span>›</span>
            <span className="text-charcoal">{project.title}</span>
          </nav>
        </div>
      </div>

      {/* Gallery */}
      <section className="py-16 bg-cream">
        <div className="container-custom">
          <span className="section-label block mb-6">Gallery</span>
          <Gallery images={project.gallery} title={project.title} category={project.category} />
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-white border-t border-border-warm" ref={descRef}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={descInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7"
            >
              <span className="section-label block mb-4">Descrizione</span>
              <p className="font-sans text-[15px] text-mid-gray leading-relaxed mb-10">
                {project.description}
              </p>
              <h3 className="font-heading text-xl font-bold text-charcoal mb-5">
                Caratteristiche tecniche
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.technicalFeatures.map((f) => (
                  <li key={f} className="font-sans text-sm text-mid-gray flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-crg-red rounded-full mt-2 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={descInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-crg-red-light border border-crg-red/15 p-8">
                <h3 className="font-heading text-xl font-bold text-charcoal mb-6">Punti di forza</h3>
                <ul className="space-y-4">
                  {project.highlights.map((h) => (
                    <li key={h} className="font-sans text-sm text-charcoal flex items-start gap-3">
                      <svg className="w-4 h-4 text-crg-red mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-8 border-t border-crg-red/15 grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-heading font-bold text-3xl text-crg-red">{project.totalUnits}</div>
                    <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Unità totali</div>
                  </div>
                  <div>
                    <div className="font-heading font-bold text-3xl text-crg-red">{availableUnits.length}</div>
                    <div className="font-sans text-[10px] tracking-widest uppercase text-mid-gray mt-1">Disponibili</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Units */}
      <section className="py-16 bg-cream border-t border-border-warm">
        <div className="container-custom">
          <span className="section-label block mb-4">Disponibilità</span>
          <h2 className="font-heading text-3xl font-bold text-charcoal mb-8">Unità disponibili</h2>
          <UnitsTable units={project.units} />
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-light-gray border-t border-border-warm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="section-label block mb-4">Avanzamento</span>
              <h2 className="font-heading text-3xl font-bold text-charcoal">Stato del progetto</h2>
              <p className="font-sans text-sm text-mid-gray mt-4 leading-relaxed">
                Dalla acquisizione fino alla consegna prevista.
              </p>
            </div>
            <div className="lg:col-span-8 lg:pl-8">
              <Timeline items={project.timeline} />
            </div>
          </div>
        </div>
      </section>

      {/* Appointment form */}
      <section id="appuntamento" className="py-16 bg-cream border-t border-border-warm">
        <div className="container-custom">
          <div className="max-w-2xl">
            <span className="section-label block mb-4">Contatto</span>
            <h2 className="font-heading text-3xl font-bold text-charcoal mb-2">Richiedi un appuntamento</h2>
            <p className="font-sans text-sm text-mid-gray mb-10 leading-relaxed">
              Compila il form per richiedere un incontro con il nostro team commerciale.
            </p>
            <AppointmentForm project={project} availableUnits={availableUnits} />
          </div>
        </div>
      </section>
    </>
  );
}
