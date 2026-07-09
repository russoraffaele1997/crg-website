export interface StaticPageDef {
  key: string;
  path: string;
  label: string;
}

export const staticPages: StaticPageDef[] = [
  { key: "home", path: "/", label: "Homepage" },
  { key: "chi-siamo", path: "/chi-siamo", label: "Chi siamo" },
  { key: "progetti", path: "/progetti", label: "Progetti (elenco)" },
  { key: "comunicazioni", path: "/comunicazioni", label: "Comunicazioni (elenco)" },
  { key: "blog", path: "/blog", label: "Blog (elenco)" },
  { key: "contatti", path: "/contatti", label: "Contatti" },
];

export function getStaticPageByKey(key: string): StaticPageDef | undefined {
  return staticPages.find((p) => p.key === key);
}
