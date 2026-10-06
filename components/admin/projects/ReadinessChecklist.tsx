import Link from "next/link";
import { CheckCircle2, Circle, Inbox } from "lucide-react";
import type { ReadinessItem } from "@/lib/admin/project-readiness";

export default function ReadinessChecklist({
  projectId,
  slug,
  items,
  published,
  newLeads,
}: {
  projectId: string;
  slug: string;
  items: ReadinessItem[];
  published: boolean;
  newLeads: number;
}) {
  const done = items.filter((i) => i.done).length;
  const missingRequired = items.filter((i) => i.required && !i.done);

  return (
    <div className="max-w-3xl mb-8 space-y-4">
      {newLeads > 0 && (
        <Link
          href={`/admin/richieste?progetto=${projectId}`}
          className="flex items-center gap-3 bg-crg-red-light border border-crg-red/20 text-crg-red rounded-xl px-5 py-3 text-sm font-medium hover:bg-crg-red/10"
        >
          <Inbox className="w-4 h-4" />
          {newLeads === 1 ? "1 nuova richiesta" : `${newLeads} nuove richieste`} per questo progetto →
        </Link>
      )}

      <details className="bg-white border border-slate-200 rounded-xl p-5 group" open={missingRequired.length > 0}>
        <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-slate-900">
            {published ? "Completezza della pagina" : "Pronto da pubblicare?"}{" "}
            <span className="font-normal text-slate-500">· {done} su {items.length}</span>
          </span>
          <span className="flex items-center gap-4">
            {published && (
              <a href={`/progetti/${slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-crg-red hover:underline">
                Vedi sul sito ↗
              </a>
            )}
            <span className="text-xs text-slate-400 group-open:hidden">Mostra</span>
          </span>
        </summary>
        {missingRequired.length > 0 && (
          <p className="text-xs text-amber-700 mt-3">
            Mancano {missingRequired.length} elementi importanti: senza, la pagina sembra incompleta a chi la visita.
          </p>
        )}
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {items.map((item) => (
            <li key={item.label}>
              <Link
                href={`/admin/progetti/${projectId}${item.tab ? `/${item.tab}` : ""}`}
                className="flex items-start gap-2 text-sm hover:text-crg-red"
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className={`w-4 h-4 shrink-0 mt-0.5 ${item.required ? "text-amber-500" : "text-slate-300"}`} />
                )}
                <span className={item.done ? "text-slate-500" : "text-slate-900"}>
                  {item.label}
                  {item.hint && !item.done && <span className="text-slate-400"> ({item.hint})</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
