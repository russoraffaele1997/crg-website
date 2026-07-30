export const categoryOptions = [
  { value: "residential", label: "Residenziale" },
  { value: "commercial", label: "Commerciale" },
  { value: "industrial", label: "Industriale" },
] as const;

export const projectStatusOptions = [
  { value: "for-sale", label: "In vendita" },
  { value: "under-construction", label: "In costruzione" },
  { value: "coming-soon", label: "In arrivo" },
  { value: "for-rent", label: "In affitto" },
] as const;

export const publishStatusOptions = [
  { value: "draft", label: "Bozza" },
  { value: "published", label: "Pubblicato" },
  { value: "archived", label: "Archiviato" },
] as const;

export const unitStatusOptions = [
  { value: "available", label: "Disponibile", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "optioned", label: "Opzionato", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "sold", label: "Venduto", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "reserved", label: "Riservato", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "rented", label: "Affittato", color: "bg-blue-100 text-blue-700 border-blue-200" },
] as const;

export function unitStatusConfig(status: string) {
  return unitStatusOptions.find((o) => o.value === status) ?? unitStatusOptions[0];
}

export const carBoxStatusOptions = [
  { value: "available", label: "Disponibile", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "optioned", label: "Opzionato", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "sold", label: "Venduto", color: "bg-red-100 text-red-700 border-red-200" },
] as const;

export function carBoxStatusConfig(status: string) {
  return carBoxStatusOptions.find((o) => o.value === status) ?? carBoxStatusOptions[0];
}
