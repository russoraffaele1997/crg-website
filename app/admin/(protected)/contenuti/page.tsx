import Link from "next/link";
import { FileText } from "lucide-react";
import { listAdminBlocks } from "@/lib/admin/data/site-content";

function formatDateTime(iso: string | null) {
  if (!iso) return "Mai modificato";
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ContenutiSitoPage() {
  const blocks = await listAdminBlocks();

  const grouped = blocks.reduce<Record<string, typeof blocks>>((acc, block) => {
    (acc[block.pageLabel] ??= []).push(block);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Contenuti sito</h1>
        <p className="text-sm text-slate-500 mt-1">
          Modifica i testi di homepage, chi siamo, footer e contatti.
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([pageLabel, items]) => (
          <div key={pageLabel}>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">{pageLabel}</h2>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {items.map((block) => (
                <Link
                  key={`${block.page}-${block.blockKey}`}
                  href={`/admin/contenuti/${block.page}/${block.blockKey}`}
                  className="flex items-center justify-between px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-crg-red-light flex items-center justify-center text-crg-red">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-800">{block.blockLabel}</span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDateTime(block.updatedAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
