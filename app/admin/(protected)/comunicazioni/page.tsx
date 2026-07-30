import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import { getAdminCommunications } from "@/lib/admin/data/communications";

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusLabel(publishStatus: string, publishedAt: string | null) {
  if (publishStatus !== "published") return { label: "Bozza", cls: "bg-slate-100 text-slate-600" };
  if (publishedAt && new Date(publishedAt) > new Date()) return { label: "Programmata", cls: "bg-amber-100 text-amber-700" };
  return { label: "Pubblicata", cls: "bg-emerald-100 text-emerald-700" };
}

export default async function ComunicazioniAdminPage() {
  const items = await getAdminCommunications();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Comunicazioni</h1>
          <p className="text-sm text-slate-500 mt-1">{items.length} comunicazioni totali</p>
        </div>
        <Link
          href="/admin/comunicazioni/nuova"
          className="flex items-center gap-2 bg-crg-red hover:bg-crg-red-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuova comunicazione
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-crg-red-light flex items-center justify-center text-crg-red mb-4">
            <Megaphone className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">Nessuna comunicazione ancora</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-medium text-slate-500 px-5 py-3">Titolo</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Categoria</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">In evidenza</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Stato</th>
                <th className="text-left font-medium text-slate-500 px-5 py-3">Pubblicazione</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = statusLabel(item.publishStatus, item.publishedAt);
                return (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link href={`/admin/comunicazioni/${item.id}`} className="font-medium text-slate-900 hover:text-crg-red">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.categoryName ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{item.isFeatured ? "Sì" : "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatDateTime(item.publishedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
