// Turns the admin-typed site address into something Google Maps can geocode.
// Real-world input like "Via G.Matteotti, SNC 80026 Casoria NA" makes Google
// show the whole world: "SNC" (senza numero civico) and initials glued to the
// street name ("G.Matteotti") break the lookup.
const COORDINATES = /^\s*-?\d{1,3}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?\s*$/;

export function mapQuery(address: string): string {
  const raw = address.trim();
  if (COORDINATES.test(raw)) return raw.replace(/\s+/g, "");

  const cleaned = raw
    .replace(/\b(?:s\.?\s?n\.?\s?c\.?|snc|s\.?\s?n\.?)(?=[\s,]|$)/gi, " ") // "SNC", "s.n.c.", "s.n."
    .replace(/\b([A-Za-zÀ-ÿ])\.(?=[A-Za-zÀ-ÿ])/g, "$1. ") // "G.Matteotti" → "G. Matteotti"
    .replace(/\s*,\s*/g, ", ")
    .replace(/(?:,\s*)+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,]+|[\s,]+$/g, "");

  return /\b(italia|italy)\b/i.test(cleaned) ? cleaned : `${cleaned}, Italia`;
}

export function mapEmbedUrl(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(mapQuery(address))}&z=16&output=embed`;
}

export function mapOpenUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(address))}`;
}
