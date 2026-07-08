import type { Metadata } from "next";
import { getContactHeroContent, getContactFinalCtaContent, getCompanyInfoContent } from "@/lib/data/site-content";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contatti — CRG | Crafted Residential Group",
};

export const revalidate = 300;

const icons = {
  sede: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  email: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  telefono: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  orari: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default async function ContattiPage() {
  const [hero, finalCta, companyInfo] = await Promise.all([
    getContactHeroContent(),
    getContactFinalCtaContent(),
    getCompanyInfoContent(),
  ]);

  const contactInfo = [
    { label: "Sede", value: companyInfo.address, icon: icons.sede },
    { label: "Email", value: companyInfo.email, href: `mailto:${companyInfo.email}`, icon: icons.email },
    { label: "Telefono", value: companyInfo.phone, href: `tel:${companyInfo.phone.replace(/\s+/g, "")}`, icon: icons.telefono },
    { label: "Orari", value: `${companyInfo.hoursWeekday}\n${companyInfo.hoursSaturday}`, icon: icons.orari },
  ];

  return (
    <>
      <section className="pt-40 pb-20 bg-charcoal">
        <div className="container-custom">
          <span className="section-label block mb-6">{hero.eyebrow}</span>
          <h1 className="section-title-light max-w-xl">{hero.title}</h1>
          <p className="font-sans text-sm text-white/35 mt-4 max-w-lg leading-relaxed">
            {hero.body}
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
            {finalCta.title}
          </h2>
          <p className="font-sans text-sm text-white/35 mb-10 max-w-md mx-auto">
            {finalCta.body}
          </p>
          <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`} className="btn-primary">{finalCta.ctaLabel}</a>
        </div>
      </section>
    </>
  );
}
