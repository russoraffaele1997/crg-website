import Link from "next/link";
import { Search } from "lucide-react";
import { listAdminPageSeo } from "@/lib/admin/data/seo";

export default async function SeoPage() {
  const pages = await listAdminPageSeo();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">SEO</h1>
        <p className="text-sm text-slate-500 mt-1">
          Meta title, meta description e Open Graph per le pagine statiche del sito. Progetti, comunicazioni e
          articoli del blog hanno i propri campi SEO nella rispettiva scheda di modifica.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {pages.map((p) => (
          <Link
            key={p.key}
            href={`/admin/seo/${p.key}`}
            className="flex items-center justify-between px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-crg-red-light flex items-center justify-center text-crg-red">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{p.label}</p>
                <p className="text-xs text-slate-400 font-mono">{p.path}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${p.configured ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {p.configured ? "Configurato" : "Non configurato"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
