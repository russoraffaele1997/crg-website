import type { Metadata } from "next";
import { getCompanyInfoContent, getPrivacyContent } from "@/lib/data/site-content";

export const revalidate = 300;

/** "## Cookie" → id="cookie", so sections can be linked (e.g. /privacy#cookie from the footer). */
function anchorOf(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const metadata: Metadata = {
  title: "Privacy — CRG | Crafted Residential Group",
  description: "Come trattiamo i dati personali raccolti attraverso il sito CRG.",
  robots: { index: false },
};

export default async function PrivacyPage() {
  const [content, company] = await Promise.all([getPrivacyContent(), getCompanyInfoContent()]);
  // Placeholders in the admin-editable text, filled from Contenuti sito → Dati aziendali.
  const holder = [
    company.legalName?.trim() || "CRG | Crafted Residential Group",
    company.vatNumber?.trim() && `P.IVA e C.F. ${company.vatNumber.trim()}`,
  ]
    .filter(Boolean)
    .join(", ");
  const tokens: Record<string, string> = {
    "{titolare}": holder,
    "{indirizzo}": `con sede legale in ${company.legalAddress?.trim() || company.address}`,
    "{email}": company.email,
    "{pec}": company.pec?.trim() || company.email,
  };
  const body = Object.entries(tokens).reduce((text, [token, value]) => text.split(token).join(value), content.body);
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <>
      <section className="pt-40 pb-14 bg-charcoal">
        <div className="container-custom">
          <span className="section-label block mb-6">Privacy</span>
          <h1 className="section-title-light max-w-3xl">{content.title}</h1>
          {content.updatedAt && (
            <p className="font-sans text-sm text-white/40 mt-4">Ultimo aggiornamento: {content.updatedAt}</p>
          )}
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl">
          {blocks.map((block, i) =>
            block.startsWith("## ") ? (
              <h2 key={i} id={anchorOf(block.slice(3))} className="font-heading text-xl font-bold text-charcoal mt-10 mb-3 scroll-mt-28">{block.slice(3)}</h2>
            ) : (
              <p key={i} className="font-sans text-[15px] text-mid-gray leading-relaxed mb-4 whitespace-pre-line">{block}</p>
            )
          )}
          <p className="font-sans text-sm text-mid-gray mt-10 pt-6 border-t border-border-warm">
            Titolare del trattamento: {holder}
            {company.rea?.trim() ? ` · REA ${company.rea.trim()}` : ""}
            <br />
            Contatti per la privacy: <a href={`mailto:${company.email}`} className="text-crg-red hover:underline">{company.email}</a>
            {company.pec?.trim() ? (
              <>
                {" "}· PEC <a href={`mailto:${company.pec.trim()}`} className="text-crg-red hover:underline">{company.pec.trim()}</a>
              </>
            ) : null}
          </p>
        </div>
      </section>
    </>
  );
}
