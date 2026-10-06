import type { CompanyInfoContent } from "@/lib/data/site-content";
import { SITE_URL } from "@/lib/site";

/**
 * schema.org data telling search engines who runs the site: the company
 * (name, legal name, logo, registered office, phone, VAT) and the website
 * name Google should display. Contact details come from Contenuti sito →
 * Dati aziendali, so they always match what visitors see.
 */
export default function StructuredData({ company }: { company: CompanyInfoContent }) {
  const phone = company.phone?.replace(/\s+/g, "") || undefined;
  const organization = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: "CRG Costruzioni",
    alternateName: ["CRG | Crafted Residential Group", "CRG Crafted Residential Group"],
    legalName: company.legalName?.trim() || "CRG S.R.L.",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/crg-logo-600.png`,
    image: `${SITE_URL}/opengraph-image.jpg`,
    description:
      "CRG S.R.L. sviluppa e costruisce progetti immobiliari residenziali, commerciali e industriali a Casoria (NA): nuove costruzioni, appartamenti e box auto in vendita.",
    telephone: phone,
    email: company.email || undefined,
    vatID: company.vatNumber?.trim() ? `IT${company.vatNumber.trim()}` : undefined,
    taxID: company.vatNumber?.trim() || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Traversa Via Michelangelo 66",
      postalCode: "80026",
      addressLocality: "Casoria",
      addressRegion: "NA",
      addressCountry: "IT",
    },
    areaServed: "Napoli e provincia",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "CRG Costruzioni",
    alternateName: ["CRG | Crafted Residential Group", "crgcostruzioni.it"],
    url: SITE_URL,
    inLanguage: "it-IT",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output only; "<" is escaped so the content can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify([organization, website]).replace(/</g, "\\u003c") }}
    />
  );
}
